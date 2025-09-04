import client, { checkConnection, ensureSchema, insertData, executeQuery } from './clickhouse'

export interface ParsedDataRecord {
  victim_id?: string
  source_name: string
  domain?: string
  email?: string
  username?: string
  password?: string
  phone?: string
  name?: string
  address?: string
  country?: string
  origin?: string
  fields?: string[]
  hostname?: string
  ip_address?: string
  language?: string
  timezone?: string
  os_version?: string
  hwid?: string
  cpu_name?: string
  gpu?: string
  ram_size?: string
  ts?: Date
}

export interface DataSource {
  id: string
  name: string
  recordCount: number
  lastUpdated: Date
  status: 'ACTIVE' | 'PROCESSING' | 'ERROR'
}

/**
 * Ingest parsed data records into ClickHouse
 */
export async function ingestDataRecords(records: ParsedDataRecord[], sourceName: string) {
  try {
    // Ensure schema exists
    await ensureSchema()

    // Transform records to match ClickHouse schema
    const transformedRecords = records.map(record => ({
      ts: record.ts || new Date(),
      victim_id: record.victim_id || `victim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source_name: sourceName,
      domain: record.domain || '',
      email: record.email || '',
      username: record.username || '',
      password: record.password || null,
      phone: record.phone || null,
      name: record.name || null,
      address: record.address || null,
      country: record.country || null,
      origin: record.origin || null,
      fields: record.fields || [],
      hostname: record.hostname || null,
      ip_address: record.ip_address || null,
      language: record.language || null,
      timezone: record.timezone || null,
      os_version: record.os_version || null,
      hwid: record.hwid || null,
      cpu_name: record.cpu_name || null,
      gpu: record.gpu || null,
      ram_size: record.ram_size || null,
    }))

    // Insert records into ClickHouse
    const result = await insertData('vault.creds', transformedRecords)

    if (result.success) {
      console.log(`Successfully ingested ${records.length} records for source: ${sourceName}`)
      return { success: true, count: records.length }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Error ingesting data records:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Get data source statistics
 */
export async function getDataSourceStats() {
  try {
    const query = `
      SELECT 
        source_name as name,
        count() as recordCount,
        max(ts) as lastUpdated,
        'ACTIVE' as status
      FROM vault.creds 
      GROUP BY source_name 
      ORDER BY lastUpdated DESC 
      LIMIT 100
    `
    
    const results = await executeQuery(query)
    
    return results.map((row: any, index: number) => ({
      id: `source_${index}`,
      name: row.name,
      recordCount: parseInt(row.recordCount),
      lastUpdated: new Date(row.lastUpdated),
      status: row.status,
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
  type?: 'ALL' | 'NAME' | 'EMAIL' | 'IP' | 'DOMAIN' | 'SOURCE' | 'USERNAME'
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

    let whereConditions: string[] = []
    let params: any = {}

    // Add search term conditions
    if (term && term.trim()) {
      const searchTerm = term.trim()
      
      switch (type) {
        case 'ALL':
          whereConditions.push(`(
            name ILIKE '%${searchTerm}%' OR 
            email ILIKE '%${searchTerm}%' OR 
            domain ILIKE '%${searchTerm}%' OR 
            source_name ILIKE '%${searchTerm}%' OR
            username ILIKE '%${searchTerm}%'
          )`)
          break
        case 'NAME':
          whereConditions.push(`name ILIKE '%${searchTerm}%'`)
          break
        case 'EMAIL':
          whereConditions.push(`email = '${searchTerm}'`)
          break
        case 'IP':
          whereConditions.push(`ip_address = '${searchTerm}'`)
          break
        case 'DOMAIN':
          whereConditions.push(`domain = '${searchTerm}'`)
          break
        case 'SOURCE':
          whereConditions.push(`source_name = '${searchTerm}'`)
          break
        case 'USERNAME':
          whereConditions.push(`username = '${searchTerm}'`)
          break
      }
    }

    // Add source filter
    if (source) {
      whereConditions.push(`source_name = '${source}'`)
    }

    // Add date range filter
    if (from) {
      whereConditions.push(`ts >= '${from.toISOString()}'`)
    }
    if (to) {
      whereConditions.push(`ts <= '${to.toISOString()}'`)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
    const offset = (page - 1) * limit

    // Main search query
    const searchQuery = `
      SELECT 
        victim_id as id,
        name,
        email,
        ip_address as ip,
        domain,
        source_name as source,
        username,
        ts as timestamp
      FROM vault.creds 
      ${whereClause}
      ORDER BY ts DESC 
      LIMIT ${limit} OFFSET ${offset}
    `

    // Count query for pagination
    const countQuery = `
      SELECT count() as total 
      FROM vault.creds 
      ${whereClause}
    `

    // Aggregation query for sources
    const sourcesQuery = `
      SELECT 
        source_name as key,
        count() as doc_count
      FROM vault.creds 
      ${whereClause}
      GROUP BY source_name 
      ORDER BY doc_count DESC 
      LIMIT 10
    `

    // Execute queries in parallel
    const [searchResults, countResults, sourcesResults] = await Promise.all([
      executeQuery(searchQuery),
      executeQuery(countQuery),
      executeQuery(sourcesQuery)
    ])

    const total = countResults[0]?.total || 0

    return {
      results: searchResults.map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        ip: row.ip,
        domain: row.domain,
        source: row.source,
        username: row.username,
        timestamp: row.timestamp,
      })),
      pagination: {
        total: parseInt(total),
        pages: Math.ceil(parseInt(total) / limit),
        current: page,
      },
      aggregations: {
        sources: sourcesResults.map((row: any) => ({
          key: row.key,
          doc_count: parseInt(row.doc_count)
        })),
        totalRecords: parseInt(total),
      },
    }
  } catch (error) {
    console.error('Error searching data records:', error)
    return {
      results: [],
      pagination: { total: 0, pages: 0, current: page || 1 },
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

    const deleteQuery = `
      ALTER TABLE vault.creds 
      DELETE WHERE ts < '${cutoffDate.toISOString()}'
    `

    await client.command({ query: deleteQuery })

    // Get count of remaining records for reporting
    const countResult = await executeQuery('SELECT count() as remaining FROM vault.creds')
    const remaining = countResult[0]?.remaining || 0

    console.log(`Deleted records older than ${olderThanDays} days. Remaining records: ${remaining}`)
    return { success: true, remaining: parseInt(remaining) }
  } catch (error) {
    console.error('Error deleting old records:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

