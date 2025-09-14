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

    // Return the live counts
    return NextResponse.json({
      credentials_24h: totalCredentials,
      cookies_24h: totalCookies,
      leakcheck_records: leakcheckTotalRecords,
      clickhouse_creds: clickhouseCredsCount,
      clickhouse_cookies: clickhouseCookiesCount,
      last_updated: new Date().toISOString()
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
    return NextResponse.json({
      credentials_24h: 1725762,
      cookies_24h: 44204833,
      leakcheck_records: 0,
      clickhouse_creds: 0,
      clickhouse_cookies: 0,
      last_updated: new Date().toISOString(),
      error: "Data sources unavailable"
    })
  }
}

// Cache for 5 minutes to reduce database load
export const revalidate = 300