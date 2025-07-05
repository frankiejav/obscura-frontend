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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { term, type, page = 1, limit = 10, source, fromDate, toDate } = body

    const query: any = {
      bool: {
        must: [],
        should: [],
      },
    }

    // Add search term
    if (term && term.trim()) {
      // Build search query based on type
      switch (type?.toUpperCase()) {
        case 'ALL':
          query.bool.should = [
            { match: { name: term } },
            { match: { email: term } },
            { match: { domain: term } },
            { match: { source: term } },
          ]
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
        default:
          query.bool.should = [
            { match: { name: term } },
            { match: { email: term } },
            { match: { domain: term } },
            { match: { source: term } },
          ]
      }
    }

    // Add source filter
    if (source) {
      query.bool.must.push({ term: { source } })
    }

    // Add date range filter
    if (fromDate || toDate) {
      const range: any = {}
      if (fromDate) range.gte = fromDate
      if (toDate) range.lte = toDate
      query.bool.must.push({ range: { timestamp: range } })
    }

    const from = (page - 1) * limit
    const result = await esClient.search({
      index: 'obscura_emails',
      body: {
        size: limit,
        from,
        query,
        sort: [{ timestamp: { order: 'desc' } }],
      } as any,
    })

    const total = getTotalHits(result)

    return NextResponse.json({
      results: result.hits.hits.map((hit: any) => Object.assign({ id: hit._id }, hit._source || {})),
      pagination: {
        total: total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    })
  } catch (error) {
    console.error('Error searching data:', error)
    return NextResponse.json({
      results: [],
      pagination: {
        total: 0,
        pages: 0,
        current: 1,
      },
    }, { status: 500 })
  }
} 