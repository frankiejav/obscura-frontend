import client from './elasticsearch'
import { ensureIndex } from './elasticsearch'

export interface ParsedDataRecord {
  name?: string
  email?: string
  ip?: string
  domain?: string
  source: string
  additionalData?: any
  timestamp?: Date
}

export interface DataSource {
  id: string
  name: string
  recordCount: number
  lastUpdated: Date
  status: 'ACTIVE' | 'PROCESSING' | 'ERROR'
}

/**
 * Ingest parsed data records into Elasticsearch
 */
export async function ingestDataRecords(records: ParsedDataRecord[], sourceName: string) {
  try {
    // Ensure indices exist
    await ensureIndex('data_records')
    await ensureIndex('data_sources')

    // Create or update data source
    const sourceId = `source_${sourceName.toLowerCase().replace(/\s+/g, '_')}`
    await client.index({
      index: 'data_sources',
      id: sourceId,
      body: {
        id: sourceId,
        name: sourceName,
        recordCount: records.length,
        lastUpdated: new Date(),
        status: 'PROCESSING',
      },
    })

    // Bulk insert records
    const operations = records.flatMap(record => [
      { index: { _index: 'data_records' } },
      {
        ...record,
        timestamp: record.timestamp || new Date(),
      },
    ])

    if (operations.length > 0) {
      const result = await client.bulk({ body: operations })
      
      // Check for errors
      if (result.errors) {
        const errors = result.items
          .filter((item: any) => item.index?.error)
          .map((item: any) => item.index.error)
        console.error('Bulk insert errors:', errors)
      }

      // Update data source status
      await client.update({
        index: 'data_sources',
        id: sourceId,
        body: {
          doc: {
            status: 'ACTIVE',
            lastUpdated: new Date(),
          },
        },
      })

      console.log(`Successfully ingested ${records.length} records for source: ${sourceName}`)
      return { success: true, count: records.length }
    }

    return { success: true, count: 0 }
  } catch (error) {
    console.error('Error ingesting data records:', error)
    
    // Update data source status to error
    try {
      const sourceId = `source_${sourceName.toLowerCase().replace(/\s+/g, '_')}`
      await client.update({
        index: 'data_sources',
        id: sourceId,
        body: {
          doc: {
            status: 'ERROR',
            lastUpdated: new Date(),
          },
        },
      })
    } catch (updateError) {
      console.error('Error updating data source status:', updateError)
    }

    return { success: false, error: error.message }
  }
}

/**
 * Get data source statistics
 */
export async function getDataSourceStats() {
  try {
    const result = await client.search({
      index: 'data_sources',
      body: {
        size: 100,
        sort: [{ lastUpdated: { order: 'desc' } }],
      },
    })

    return result.hits.hits.map((hit: any) => ({
      ...hit._source,
      id: hit._id,
    }))
  } catch (error) {
    console.error('Error getting data source stats:', error)
    return []
  }
}

/**
 * Search data records with advanced filtering
 */
export async function searchDataRecords(options: {
  term?: string
  type?: 'ALL' | 'NAME' | 'EMAIL' | 'IP' | 'DOMAIN' | 'SOURCE'
  source?: string
  from?: Date
  to?: Date
  page?: number
  limit?: number
}) {
  try {
    const {
      term,
      type = 'ALL',
      source,
      from,
      to,
      page = 1,
      limit = 10,
    } = options

    const query: any = {
      bool: {
        must: [],
      },
    }

    // Add search term
    if (term) {
      switch (type) {
        case 'ALL':
          query.bool.must.push({
            multi_match: {
              query: term,
              fields: ['name', 'email', 'domain', 'source'],
              type: 'best_fields',
            },
          })
          break
        case 'NAME':
          query.bool.must.push({ match: { name: term } })
          break
        case 'EMAIL':
          query.bool.must.push({ term: { email: term } })
          break
        case 'IP':
          query.bool.must.push({ term: { ip: term } })
          break
        case 'DOMAIN':
          query.bool.must.push({ term: { domain: term } })
          break
        case 'SOURCE':
          query.bool.must.push({ term: { source: term } })
          break
      }
    }

    // Add source filter
    if (source) {
      query.bool.must.push({ term: { source } })
    }

    // Add date range filter
    if (from || to) {
      const range: any = {}
      if (from) range.gte = from.toISOString()
      if (to) range.lte = to.toISOString()
      query.bool.must.push({ range: { timestamp: range } })
    }

    const result = await client.search({
      index: 'data_records',
      body: {
        size: limit,
        from: (page - 1) * limit,
        query,
        sort: [{ timestamp: { order: 'desc' } }],
        aggs: {
          sources: {
            terms: { field: 'source' },
          },
          total_records: {
            value_count: { field: '_id' },
          },
        },
      },
    })

    return {
      results: result.hits.hits.map((hit: any) => ({
        ...hit._source,
        id: hit._id,
      })),
      pagination: {
        total: result.hits.total.value,
        pages: Math.ceil(result.hits.total.value / limit),
        current: page,
      },
      aggregations: {
        sources: result.aggregations?.sources?.buckets || [],
        totalRecords: result.aggregations?.total_records?.value || 0,
      },
    }
  } catch (error) {
    console.error('Error searching data records:', error)
    return {
      results: [],
      pagination: { total: 0, pages: 0, current: page },
      aggregations: { sources: [], totalRecords: 0 },
    }
  }
}

/**
 * Delete old records (cleanup utility)
 */
export async function deleteOldRecords(olderThanDays: number) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const result = await client.deleteByQuery({
      index: 'data_records',
      body: {
        query: {
          range: {
            timestamp: {
              lt: cutoffDate.toISOString(),
            },
          },
        },
      },
    })

    console.log(`Deleted ${result.deleted} old records`)
    return { success: true, deleted: result.deleted }
  } catch (error) {
    console.error('Error deleting old records:', error)
    return { success: false, error: error.message }
  }
} 