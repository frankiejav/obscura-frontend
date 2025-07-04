import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { signJWT } from "@/lib/jwt"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `

    if (existingUsers.length > 0) {
      // Log failed signup attempt
      await sql`
        INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
        VALUES (
          NULL,
          'SIGNUP_FAILED',
          ${JSON.stringify({ email, reason: "email_already_exists" })},
          ${req.headers.get("x-forwarded-for") ?? "unknown"},
          ${req.headers.get("user-agent") ?? "unknown"}
        )
      `

      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    // Hash password
    const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS || "12")
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user (role is always 'client' for signups)
    const newUsers = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${passwordHash}, 'client')
      RETURNING id, name, email, role, is_active, created_at
    `

    const newUser = newUsers[0]

    // Create JWT tokens
    const token = await signJWT({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    })

    const refreshToken = await signJWT(
      {
        userId: newUser.id,
        type: "refresh",
      },
      { expiresIn: "7d" },
    )

    // Log successful signup
    await sql`
      INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
      VALUES (
        ${newUser.id},
        'SIGNUP_SUCCESS',
        ${JSON.stringify({ email, name })},
        ${req.headers.get("x-forwarded-for") ?? "unknown"},
        ${req.headers.get("user-agent") ?? "unknown"}
      )
    `

    return NextResponse.json({
      user: newUser,
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
