import { type NextRequest, NextResponse } from "next/server"
import { Client } from "pg"
import { Client as ElasticClient } from "@elastic/elasticsearch"

export async function GET(request: NextRequest) {
  try {
    // Connect to PostgreSQL
    const pgClient = new Client({
      connectionString: process.env.DATABASE_URL,
    })
    await pgClient.connect()

    // Connect to Elasticsearch
    const esClient = new ElasticClient({
      node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
    })

    // Get real-time metrics
    const [
      userCount,
      activeUsers,
      auditLogs,
      esDataCount,
      esSearchCount,
      systemUptime,
      userRoleStats
    ] = await Promise.all([
      // Total users
      pgClient.query("SELECT COUNT(*) as count FROM users WHERE is_active = true"),
      
      // Active users (logged in within last 24 hours)
      pgClient.query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE is_active = true 
        AND last_login > NOW() - INTERVAL '24 hours'
      `),
      
      // Recent audit logs
      pgClient.query(`
        SELECT COUNT(*) as count 
        FROM audit_logs 
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `),
      
      // Elasticsearch data count
      esClient.count({ index: "obscura_data" }).catch(() => ({ count: 0 })),
      
      // Elasticsearch search count (from analytics index)
      esClient.count({ index: "obscura_analytics" }).catch(() => ({ count: 0 })),
      
      // System uptime (since first user creation)
      pgClient.query(`
        SELECT 
          EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) / 3600 as uptime_hours
        FROM users
      `),
      
      // User role statistics
      pgClient.query(`
        SELECT 
          role,
          COUNT(*) as count,
          COUNT(CASE WHEN last_login > NOW() - INTERVAL '24 hours' THEN 1 END) as active_count
        FROM users 
        WHERE is_active = true
        GROUP BY role
        ORDER BY role
      `)
    ])

    // Get chart data
    const [missionData, activityData] = await Promise.all([
      // Mission success rate (last 6 months)
      pgClient.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as name,
          COUNT(CASE WHEN action LIKE '%SUCCESS%' THEN 1 END) as successful,
          COUNT(CASE WHEN action LIKE '%FAIL%' OR action LIKE '%ERROR%' THEN 1 END) as failed
        FROM audit_logs 
        WHERE created_at > NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      `),
      
      // 24h activity (hourly breakdown)
      pgClient.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('hour', created_at), 'HH24:00') as time,
          COUNT(*) as queries,
          COUNT(CASE WHEN action LIKE '%ALERT%' THEN 1 END) as alerts
        FROM audit_logs 
        WHERE created_at > NOW() - INTERVAL '24 hours'
        GROUP BY DATE_TRUNC('hour', created_at)
        ORDER BY DATE_TRUNC('hour', created_at)
      `)
    ])

    // Get system status
    const systemStatus = {
      api: "optimal",
      database: "online", 
      security: "scanning"
    }

    // Get user connections by region
    const userConnections = await pgClient.query(`
      SELECT 
        COALESCE(country, 'Unknown') as region,
        COUNT(DISTINCT user_id) as active_users,
        COUNT(*) as total_connections
      FROM user_connections 
      WHERE last_seen > NOW() - INTERVAL '24 hours'
      GROUP BY country
      ORDER BY active_users DESC
      LIMIT 5
    `)

    await pgClient.end()

    // Format user role statistics
    const userRoles = userRoleStats.rows.reduce((acc, row) => {
      acc[row.role] = {
        total: parseInt(String(row.count || "0")),
        active: parseInt(String(row.active_count || "0"))
      }
      return acc
    }, {} as Record<string, { total: number; active: number }>)

    // Format the response
    const analytics = {
      metrics: {
        activeQueries: parseInt(String(auditLogs.rows[0]?.count || "0")),
        intelRecords: parseInt(String(esDataCount.count || "0")),
        activeUsers: parseInt(String(activeUsers.rows[0]?.count || "0")),
        totalUsers: parseInt(String(userCount.rows[0]?.count || "0")),
        threatLevel: "MEDIUM",
        activeThreats: 3
      },
      userAllocation: {
        admin: userRoles.admin || { total: 0, active: 0 },
        client: userRoles.client || { total: 0, active: 0 }
      },
      charts: {
        missionData: missionData.rows.map(row => ({
          name: row.name,
          successful: parseInt(String(row.successful || "0")),
          failed: parseInt(String(row.failed || "0"))
        })),
        activityData: activityData.rows.map(row => ({
          time: row.time,
          queries: parseInt(String(row.queries || "0")),
          alerts: parseInt(String(row.alerts || "0"))
        }))
      },
      system: {
        status: systemStatus,
        uptime: Math.floor(parseFloat(systemUptime.rows[0]?.uptime_hours || "0")),
        userConnections: userConnections.rows.map(row => ({
          region: row.region,
          activeUsers: parseInt(String(row.active_users || "0")),
          totalConnections: parseInt(String(row.total_connections || "0"))
        }))
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
} 