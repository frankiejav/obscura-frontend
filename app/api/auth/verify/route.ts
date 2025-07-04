import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/jwt"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyJWT(token)

    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
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

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
