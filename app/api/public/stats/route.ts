import { NextResponse } from "next/server"
import clickhouse from "@/lib/clickhouse"

export async function GET() {
  try {
    // Query ClickHouse for total rows in cookies and creds tables using direct table queries
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
    const credentialsCount = credsData.length > 0 ? parseInt(credsData[0].count) : 0
    const cookiesCount = cookiesData.length > 0 ? parseInt(cookiesData[0].count) : 0

    // Return the live counts
    return NextResponse.json({
      credentials_24h: credentialsCount,
      cookies_24h: cookiesCount,
      last_updated: new Date().toISOString()
    })
  } catch (error) {
    console.error("ClickHouse Stats API error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      clickhouseUrl: process.env.CLICKHOUSE_URL || 'not set',
      clickhouseHost: process.env.CLICKHOUSE_HOST || 'not set',
      clickhouseDatabase: process.env.CLICKHOUSE_DATABASE || 'not set'
    })
    
    // Return fallback numbers if ClickHouse is unavailable
    return NextResponse.json({
      credentials_24h: 1725762,
      cookies_24h: 44204833,
      last_updated: new Date().toISOString(),
      error: "ClickHouse connection failed"
    })
  }
}

// Cache for 5 minutes to reduce database load
export const revalidate = 300
