import { type NextRequest, NextResponse } from "next/server"
import { Client } from "pg"

export async function GET(request: NextRequest) {
  try {
    const pgClient = new Client({
      connectionString: process.env.DATABASE_URL,
    })
    await pgClient.connect()

    // Get all users with their activity data
    const result = await pgClient.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        u.last_login,
        u.is_active,
        COUNT(a.id) as audit_count,
        MAX(a.created_at) as last_activity
      FROM users u
      LEFT JOIN audit_logs a ON u.id = a.user_id
      GROUP BY u.id, u.name, u.email, u.role, u.created_at, u.last_login, u.is_active
      ORDER BY u.created_at DESC
    `)

    await pgClient.end()

    // Format the response
    const users = result.rows.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.is_active ? "active" : "inactive",
      lastActive: user.last_activity || user.last_login || user.created_at,
      auditCount: parseInt(user.audit_count || "0"),
      createdAt: user.created_at
    }))

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Users API error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
} 