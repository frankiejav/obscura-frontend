import { NextRequest, NextResponse } from 'next/server'
import { searchDataRecords } from '@/lib/data-ingestion'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const first = parseInt(searchParams.get('first') || '10')
    const after = parseInt(searchParams.get('after') || '0')
    const source = searchParams.get('source') || undefined

    // Calculate page number from cursor
    const page = Math.floor(after / first) + 1

    // Use ClickHouse search function
    const result = await searchDataRecords({
      source,
      page,
      limit: first,
    })

    // Transform results to GraphQL-style edges format
    const edges = result.results.map((record: any, index: number) => ({
      node: record,
      cursor: (after + index).toString(),
    }))

    const hasNextPage = result.pagination.current < result.pagination.pages
    const hasPreviousPage = result.pagination.current > 1

    return NextResponse.json({
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount: result.pagination.total,
    })
  } catch (error) {
    console.error('Error fetching data records:', error)
    
    return NextResponse.json({
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    })
  }
} 