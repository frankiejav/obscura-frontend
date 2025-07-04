import { type NextRequest } from "next/server"
import { Client } from "pg"
import { Client as ElasticClient } from "@elastic/elasticsearch"

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendData = (data: any) => {
        const chunk = encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        controller.enqueue(chunk)
      }

      const sendError = (error: string) => {
        const chunk = encoder.encode(`data: ${JSON.stringify({ error })}\n\n`)
        controller.enqueue(chunk)
      }

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

        // Function to fetch and send analytics data
        const fetchAndSendAnalytics = async () => {
          try {
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

            // Format user role statistics
            const userRoles = userRoleStats.rows.reduce((acc: any, row: any) => {
              acc[row.role] = {
                total: parseInt(String(row.count || "0")),
                active: parseInt(String(row.active_count || "0"))
              }
              return acc
            }, {})

            // Format the response
            const analytics = {
              type: 'analytics',
              timestamp: new Date().toISOString(),
              data: {
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
                  missionData: missionData.rows.map((row: any) => ({
                    name: row.name,
                    successful: parseInt(String(row.successful || "0")),
                    failed: parseInt(String(row.failed || "0"))
                  })),
                  activityData: activityData.rows.map((row: any) => ({
                    time: row.time,
                    queries: parseInt(String(row.queries || "0")),
                    alerts: parseInt(String(row.alerts || "0"))
                  }))
                },
                system: {
                  status: {
                    api: "optimal",
                    database: "online", 
                    security: "scanning"
                  },
                  uptime: Math.floor(parseFloat(systemUptime.rows[0]?.uptime_hours || "0")),
                  userConnections: userConnections.rows.map((row: any) => ({
                    region: row.region,
                    activeUsers: parseInt(String(row.active_users || "0")),
                    totalConnections: parseInt(String(row.total_connections || "0"))
                  }))
                }
              }
            }

            sendData(analytics)
          } catch (error) {
            console.error("Error fetching analytics:", error)
            sendError("Failed to fetch analytics data")
          }
        }

        // Send initial data
        await fetchAndSendAnalytics()

        // Set up interval for updates (every 10 seconds for real-time feel)
        const interval = setInterval(async () => {
          await fetchAndSendAnalytics()
        }, 10000)

        // Clean up on client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(interval)
          pgClient.end()
        })

      } catch (error) {
        console.error("Stream error:", error)
        sendError("Failed to establish stream")
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
} 