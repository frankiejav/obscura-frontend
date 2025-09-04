import { NextRequest, NextResponse } from 'next/server'
import { searchDataRecords, searchProfileCredentials } from '@/lib/data-ingestion'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { term, type, page = 1, limit = 10, source, fromDate, toDate, profilesEnabled = false } = body

    // Convert date strings to Date objects if provided
    const from = fromDate ? new Date(fromDate) : undefined
    const to = toDate ? new Date(toDate) : undefined

    // Use ClickHouse search function
    const result = await searchDataRecords({
      term: term?.trim(),
      type: type?.toUpperCase() || 'ALL',
      source,
      from,
      to,
      page,
      limit,
    })

    let profileResults: any[] = []
    
    // If profiles are enabled, get all credentials for the same victim_ids
    if (profilesEnabled && result.results.length > 0) {
      const victimIds = [...new Set(result.results.map(r => r.id))] // Get unique victim IDs
      profileResults = await searchProfileCredentials(victimIds)
    }

    return NextResponse.json({
      results: result.results,
      profileResults: profileResults,
      pagination: result.pagination,
      aggregations: result.aggregations,
      profilesEnabled,
    })
  } catch (error) {
    console.error('Error searching data:', error)
    return NextResponse.json({
      results: [],
      profileResults: [],
      pagination: {
        total: 0,
        pages: 0,
        current: 1,
      },
      aggregations: {
        sources: [],
        totalRecords: 0,
      },
      profilesEnabled: false,
    }, { status: 500 })
  }
} 