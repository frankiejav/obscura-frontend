import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { signJWT } from "@/lib/jwt"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user (always as client role)
    const newUsers = await sql`
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES (${name}, ${email}, ${passwordHash}, 'client', true)
      RETURNING id, name, email, role, created_at
    `

    const user = newUsers[0]

    // Create JWT tokens
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = await signJWT(
      {
        userId: user.id,
        type: "refresh",
      },
      { expiresIn: "7d" },
    )

    // Log successful signup
    await sql`
      INSERT INTO audit_logs (user_id, action, resource, details, ip_address, user_agent)
      VALUES (
        ${user.id},
        'SIGNUP_SUCCESS',
        'auth',
        '{}',
        ${req.headers.get("x-forwarded-for") ?? "unknown"},
        ${req.headers.get("user-agent") ?? "unknown"}
      )
    `

    return NextResponse.json({
      user,
      token,
      refreshToken,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
