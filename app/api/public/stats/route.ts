import { NextResponse } from "next/server"
import clickhouse from "@/lib/clickhouse"

interface LeakCheckDatabase {
  id: number
  name: string
  count: number
  breach_date: string | null
  unverified: number
  passwordless: number
  compilation: number
}

interface LeakCheckResponse {
  data: LeakCheckDatabase[]
}

export async function GET() {
  try {
    // Initialize counters
    let leakcheckTotalRecords = 0
    let clickhouseCredsCount = 0
    let clickhouseCookiesCount = 0

    // Fetch LeakCheck databases info (no API key needed for databases-list)
    try {
      const leakcheckResponse = await fetch("https://leakcheck.io/databases-list")
      
      if (leakcheckResponse.ok) {
        const leakcheckData: LeakCheckResponse = await leakcheckResponse.json()
        if (leakcheckData.data && Array.isArray(leakcheckData.data)) {
          // Count total records from all LeakCheck databases
          leakcheckTotalRecords = leakcheckData.data.reduce((sum, db) => sum + (db.count || 0), 0)
        }
      }
    } catch (leakcheckError) {
      console.error("LeakCheck API error:", leakcheckError)
      // Continue with default values if LeakCheck fails
    }

    // Query ClickHouse for total rows in cookies and creds tables
    try {
      const [credsResult, cookiesResult] = await Promise.all([
        clickhouse.query({
          query: 'SELECT COUNT(*) as count FROM vault.creds',
          format: 'JSONEachRow'
        }),
        clickhouse.query({
          query: 'SELECT COUNT(*) as count FROM vault.cookies',
          format: 'JSONEachRow'
        })
      ])
      
      const credsData = await credsResult.json() as Array<{ count: string }>
      const cookiesData = await cookiesResult.json() as Array<{ count: string }>
      
      // Parse the results
      clickhouseCredsCount = credsData.length > 0 ? parseInt(credsData[0].count) : 0
      clickhouseCookiesCount = cookiesData.length > 0 ? parseInt(cookiesData[0].count) : 0
    } catch (clickhouseError) {
      console.error("ClickHouse query error:", clickhouseError)
      // Continue with zero values if ClickHouse fails
    }

    // Calculate totals according to dashboard logic:
    // Total Credentials = LeakCheck records + ClickHouse creds
    // Total Cookies = ClickHouse cookies only
    const totalCredentials = leakcheckTotalRecords + clickhouseCredsCount
    const totalCookies = clickhouseCookiesCount
    
    // Combined total records (credentials + cookies)
    const totalRecords = totalCredentials + totalCookies

    // Return the live counts with explicit cache headers
    // This ensures the response is cached at the server/CDN level for 24 hours
    return NextResponse.json({
      total_records: totalRecords,
      credentials_24h: totalCredentials,
      cookies_24h: totalCookies,
      leakcheck_records: leakcheckTotalRecords,
      clickhouse_creds: clickhouseCredsCount,
      clickhouse_cookies: clickhouseCookiesCount,
      last_updated: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600'
      }
    })
  } catch (error) {
    console.error("Public Stats API error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      clickhouseUrl: process.env.CLICKHOUSE_URL || 'not set',
      clickhouseHost: process.env.CLICKHOUSE_HOST || 'not set',
      clickhouseDatabase: process.env.CLICKHOUSE_DATABASE || 'not set'
    })
    
    // Return fallback numbers if services are unavailable
    const fallbackCredentials = 1725762
    const fallbackCookies = 44204833
    const fallbackTotal = fallbackCredentials + fallbackCookies
    
    return NextResponse.json({
      total_records: fallbackTotal,
      credentials_24h: fallbackCredentials,
      cookies_24h: fallbackCookies,
      leakcheck_records: 0,
      clickhouse_creds: 0,
      clickhouse_cookies: 0,
      last_updated: new Date().toISOString(),
      error: "Data sources unavailable"
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600'
      }
    })
  }
}

// Cache for 24 hours to significantly reduce database load and compute costs
// The count changes slowly enough that daily updates are reasonable
export const revalidate = 86400