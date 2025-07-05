import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/elasticsearch'

const esClient = client as any

export async function GET() {
  try {
    // Check if Elasticsearch client is available
    if (!esClient) {
      console.log('Elasticsearch client not available, returning default data source')
      return NextResponse.json([{
        id: 'default',
        name: 'Default Data Source',
        recordCount: 0,
        lastUpdated: new Date().toISOString(),
        status: 'ACTIVE'
      }])
    }

    // Get record counts from different indices
    const [emailsResult, personalInfoResult, recordsResult] = await Promise.all([
      esClient.search({
        index: 'obscura_emails',
        body: {
          size: 0,
          aggs: {
            total_records: { value_count: { field: '_id' } },
            sources: { terms: { field: 'source', size: 100 } }
          }
        } as any,
      }),
      esClient.search({
        index: 'obscura_personal_info',
        body: {
          size: 0,
          aggs: {
            total_records: { value_count: { field: '_id' } },
            sources: { terms: { field: 'source', size: 100 } }
          }
        } as any,
      }),
      esClient.search({
        index: 'obscura_records',
        body: {
          size: 0,
          aggs: {
            total_records: { value_count: { field: '_id' } },
            sources: { terms: { field: 'source', size: 100 } }
          }
        } as any,
      })
    ])

    // Create data sources based on actual data
    const dataSources = []
    
    // Add email data source
    const emailCount = emailsResult.aggregations?.total_records?.value || 0
    if (emailCount > 0) {
      dataSources.push({
        id: 'emails',
        name: 'Email Records',
        recordCount: emailCount,
        lastUpdated: new Date().toISOString(),
        status: 'ACTIVE'
      })
    }

    // Add personal info data source
    const personalInfoCount = personalInfoResult.aggregations?.total_records?.value || 0
    if (personalInfoCount > 0) {
      dataSources.push({
        id: 'personal_info',
        name: 'Personal Information',
        recordCount: personalInfoCount,
        lastUpdated: new Date().toISOString(),
        status: 'ACTIVE'
      })
    }

    // Add general records data source
    const recordsCount = recordsResult.aggregations?.total_records?.value || 0
    if (recordsCount > 0) {
      dataSources.push({
        id: 'records',
        name: 'General Records',
        recordCount: recordsCount,
        lastUpdated: new Date().toISOString(),
        status: 'ACTIVE'
      })
    }

    // If no data sources found, create a default one
    if (dataSources.length === 0) {
      dataSources.push({
        id: 'default',
        name: 'Default Data Source',
        recordCount: 0,
        lastUpdated: new Date().toISOString(),
        status: 'ACTIVE'
      })
    }

    return NextResponse.json(dataSources)
  } catch (error) {
    console.error('Error fetching data sources:', error)
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('security_exception')) {
      console.log('Elasticsearch authentication failed, returning default data source')
    }
    
    return NextResponse.json([{
      id: 'default',
      name: 'Default Data Source',
      recordCount: 0,
      lastUpdated: new Date().toISOString(),
      status: 'ACTIVE'
    }])
  }
} 