import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT, signJWT } from "@/lib/jwt"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json()

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 })
    }

    // Verify refresh token
    const payload = await verifyJWT(refreshToken)
    if (!payload || !payload.userId || payload.type !== "refresh") {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    // Get user from database
    const users = await sql`
      SELECT id, email, name, role, is_active
      FROM users 
      WHERE id = ${payload.userId} 
      LIMIT 1
    `

    const user = users[0]
    if (!user || !user.is_active) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
    }

    // Generate new access token
    const newToken = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Log token refresh
    await sql`
      INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
      VALUES (
        ${user.id},
        'TOKEN_REFRESH',
        ${JSON.stringify({ email: user.email })},
        ${req.headers.get("x-forwarded-for") ?? "unknown"},
        ${req.headers.get("user-agent") ?? "unknown"}
      )
    `

    return NextResponse.json({
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
  }
}
