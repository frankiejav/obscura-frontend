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

    const payload = await verifyJWT(refreshToken)
    if (!payload || payload.type !== "refresh" || !payload.userId) {
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

    // Create new tokens
    const newToken = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const newRefreshToken = await signJWT(
      {
        userId: user.id,
        type: "refresh",
      },
      { expiresIn: "7d" },
    )

    return NextResponse.json({
      user,
      token: newToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
  }
}
