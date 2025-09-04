import { NextRequest, NextResponse } from 'next/server'
import { getDataSourceStats } from '@/lib/data-ingestion'

export async function GET() {
  try {
    // Get data source statistics from ClickHouse
    const dataSources = await getDataSourceStats()

    // If no data sources found, create a default one
    if (dataSources.length === 0) {
      return NextResponse.json([{
        id: 'default',
        name: 'Default Data Source',
        recordCount: 0,
        lastUpdated: new Date().toISOString(),
        status: 'ACTIVE'
      }])
    }

    // Convert dates to ISO strings for JSON response
    const formattedDataSources = dataSources.map((source: any) => ({
      ...source,
      lastUpdated: source.lastUpdated.toISOString()
    }))

    return NextResponse.json(formattedDataSources)
  } catch (error) {
    console.error('Error fetching data sources:', error)
    
    return NextResponse.json([{
      id: 'default',
      name: 'Default Data Source',
      recordCount: 0,
      lastUpdated: new Date().toISOString(),
      status: 'ACTIVE'
    }])
  }
} 