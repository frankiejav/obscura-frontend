import { NextResponse } from "next/server"
import { auth0 } from "@/lib/auth0"
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

interface DashboardStats {
  totalRecords: number
  totalSources: number
  activeSources: number
  recentRecords: number
  leakcheckDatabases: number
  credentialsCount: number
  cookiesCount: number
  last24hActivity: number
}

export async function GET() {
  try {
    // Check if Auth0 is configured
    if (!auth0) {
      // Return default stats when auth is not configured
      return NextResponse.json({
        totalRecords: 0,
        totalDatabases: 0,
        latestBreach: null,
        recentActivity: [],
        breachTrend: [],
        userCount: 0,
        activeSessions: 0,
        userTrend: []
      })
    }
    
    // Check if user is authenticated
    const session = await auth0.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize stats with default values
    const stats: DashboardStats = {
      totalRecords: 0,
      totalSources: 0,
      activeSources: 0,
      recentRecords: 0,
      leakcheckDatabases: 0,
      credentialsCount: 0,
      cookiesCount: 0,
      last24hActivity: 0,
    }

    let leakcheckTotalRecords = 0
    let leakcheckDatabaseCount = 0

    // Fetch LeakCheck databases info (no API key needed for databases-list)
    try {
      const leakcheckResponse = await fetch("https://leakcheck.io/databases-list")

      if (leakcheckResponse.ok) {
        const leakcheckData: LeakCheckResponse = await leakcheckResponse.json()
        if (leakcheckData.data && Array.isArray(leakcheckData.data)) {
          // Count total records from all LeakCheck databases
          leakcheckTotalRecords = leakcheckData.data.reduce((sum, db) => sum + (db.count || 0), 0)
          
          // Count number of LeakCheck databases
          leakcheckDatabaseCount = leakcheckData.data.length
          stats.leakcheckDatabases = leakcheckDatabaseCount
        }
      }
    } catch (leakcheckError) {
      console.error("LeakCheck API error:", leakcheckError)
      // Continue with default values if LeakCheck fails
    }

    // Get ClickHouse stats
    let clickhouseCredsCount = 0
    let clickhouseCookiesCount = 0
    let recentActivityCount = 0

    try {
      // Get total credentials count from ClickHouse
      const credsCountResult = await clickhouse.query({
        query: "SELECT count() as count FROM vault.creds",
        format: "JSONEachRow",
      })
      const credsCountData = await credsCountResult.json()
      if (credsCountData && credsCountData[0]) {
        clickhouseCredsCount = parseInt(credsCountData[0].count)
        stats.credentialsCount = clickhouseCredsCount
      }

      // Get total cookies count from ClickHouse
      const cookiesCountResult = await clickhouse.query({
        query: "SELECT count() as count FROM vault.cookies",
        format: "JSONEachRow",
      })
      const cookiesCountData = await cookiesCountResult.json()
      if (cookiesCountData && cookiesCountData[0]) {
        clickhouseCookiesCount = parseInt(cookiesCountData[0].count)
        stats.cookiesCount = clickhouseCookiesCount
      }

      // Get records from last 7 days (recent activity) - combining both tables
      const recentCredsResult = await clickhouse.query({
        query: `
          SELECT count() as count 
          FROM vault.creds 
          WHERE ts >= now() - INTERVAL 7 DAY
        `,
        format: "JSONEachRow",
      })
      const recentCredsData = await recentCredsResult.json()
      let recentCreds = 0
      if (recentCredsData && recentCredsData[0]) {
        recentCreds = parseInt(recentCredsData[0].count)
      }

      const recentCookiesResult = await clickhouse.query({
        query: `
          SELECT count() as count 
          FROM vault.cookies 
          WHERE ts >= now() - INTERVAL 7 DAY
        `,
        format: "JSONEachRow",
      })
      const recentCookiesData = await recentCookiesResult.json()
      let recentCookies = 0
      if (recentCookiesData && recentCookiesData[0]) {
        recentCookies = parseInt(recentCookiesData[0].count)
      }

      // Recent activity = records from last 7 days
      recentActivityCount = recentCreds + recentCookies
      stats.recentRecords = recentActivityCount
      stats.last24hActivity = recentActivityCount // Using same value for compatibility

      // Get unique sources count from ClickHouse credentials
      const sourcesResult = await clickhouse.query({
        query: "SELECT count(DISTINCT source_name) as count FROM vault.creds",
        format: "JSONEachRow",
      })
      const sourcesData = await sourcesResult.json()
      let clickhouseSourcesCount = 0
      if (sourcesData && sourcesData[0]) {
        clickhouseSourcesCount = parseInt(sourcesData[0].count)
      }
      
      // Data sources = LeakCheck databases count + 1 (for ClickHouse data)
      stats.totalSources = leakcheckDatabaseCount + 1
      stats.activeSources = stats.totalSources // All sources considered active
      
    } catch (clickhouseError) {
      console.error("ClickHouse query error:", clickhouseError)
      // Continue with partial values if ClickHouse fails
    }

    // Total records = LeakCheck total + ClickHouse (creds + cookies)
    stats.totalRecords = leakcheckTotalRecords + clickhouseCredsCount + clickhouseCookiesCount

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    // Return default stats on error
    return NextResponse.json({
      totalRecords: 0,
      totalSources: 0,
      activeSources: 0,
      recentRecords: 0,
      leakcheckDatabases: 0,
      credentialsCount: 0,
      cookiesCount: 0,
      last24hActivity: 0,
    })
  }
}