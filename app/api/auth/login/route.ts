import { type NextRequest, NextResponse } from "next/server"
import { signJWT } from "@/lib/jwt"
import { logRequest } from "@/lib/audit-logger"
import { Client } from "pg"
import bcrypt from "bcrypt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt:", { email, password }) // Debug log

    // Connect to PostgreSQL database
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    })

    await client.connect()

    // Find user by email
    const result = await client.query(
      "SELECT id, email, name, password_hash, role FROM users WHERE email = $1 AND is_active = true",
      [email]
    )

    if (result.rows.length === 0) {
      console.log("User not found") // Debug log
      await client.end()
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const user = result.rows[0]
    console.log("User found:", { id: user.id, email: user.email, role: user.role }) // Debug log

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      console.log("Password mismatch") // Debug log
      await client.end()
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log("Password verified successfully") // Debug log

    // Update last login
    await client.query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id]
    )

    // Create tokens
    const token = await signJWT(
      {
        sub: user.id.toString(),
        email: user.email,
        role: user.role,
      },
      "15m", // 15 minutes
    )

    const refreshToken = await signJWT(
      {
        sub: user.id.toString(),
        type: "refresh",
      },
      "7d", // 7 days
    )

    // Log the login
    await logRequest({
      userId: user.id.toString(),
      action: "login",
      details: {
        ip: request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    })

    await client.end()

    console.log("Login successful, returning tokens") // Debug log

    // Return response with tokens
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      refreshToken,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
