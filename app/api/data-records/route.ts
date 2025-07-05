import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/elasticsearch'

const esClient = client as any

// Helper to get total hits value safely
function getTotalHits(result: any): number {
  if (!result || !result.hits || typeof result.hits.total === 'undefined') return 0;
  if (typeof result.hits.total === 'number') return result.hits.total;
  if (typeof result.hits.total.value === 'number') return result.hits.total.value;
  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const first = parseInt(searchParams.get('first') || '10')
    const after = searchParams.get('after') || '0'
    const source = searchParams.get('source')

    const query: any = {
      bool: {
        must: [],
      },
    }

    if (source) {
      query.bool.must.push({ term: { source } })
    }

    const result = await esClient.search({
      index: 'obscura_emails',
      body: {
        size: first,
        from: parseInt(after),
        query,
        sort: [{ timestamp: { order: 'desc' } }],
      } as any,
    })

    const edges = result.hits.hits.map((hit: any) => ({
      node: Object.assign({ id: hit._id }, hit._source || {}),
      cursor: hit._id,
    }))

    const total = getTotalHits(result)

    return NextResponse.json({
      edges,
      pageInfo: {
        hasNextPage: total > (parseInt(after) + first),
        hasPreviousPage: parseInt(after) > 0,
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
      },
      totalCount: total,
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
    }, { status: 500 })
  }
} 