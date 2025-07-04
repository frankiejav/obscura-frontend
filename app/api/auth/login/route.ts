import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { signJWT } from "@/lib/jwt"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    // Find user by email
    const users = await sql`
      SELECT id, email, name, role, password_hash, is_active
      FROM users 
      WHERE email = ${email} 
      LIMIT 1
    `

    const user = users[0]
    if (!user || !user.is_active) {
      console.log("User not found or inactive:", email)

      // Log failed login attempt
      await sql`
        INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
        VALUES (
          NULL,
          'LOGIN_FAILED',
          ${JSON.stringify({ email, reason: "user_not_found" })},
          ${req.headers.get("x-forwarded-for") ?? "unknown"},
          ${req.headers.get("user-agent") ?? "unknown"}
        )
      `

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      console.log("Invalid password for user:", email)

      // Log failed login attempt
      await sql`
        INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
        VALUES (
          ${user.id},
          'LOGIN_FAILED',
          ${JSON.stringify({ email, reason: "invalid_password" })},
          ${req.headers.get("x-forwarded-for") ?? "unknown"},
          ${req.headers.get("user-agent") ?? "unknown"}
        )
      `

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    await sql`
      UPDATE users 
      SET last_login = NOW() 
      WHERE id = ${user.id}
    `

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

    // Log successful login
    await sql`
      INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
      VALUES (
        ${user.id},
        'LOGIN_SUCCESS',
        ${JSON.stringify({ email })},
        ${req.headers.get("x-forwarded-for") ?? "unknown"},
        ${req.headers.get("user-agent") ?? "unknown"}
      )
    `

    // Return user data (without password hash)
    const { password_hash, ...safeUser } = user

    return NextResponse.json({
      user: safeUser,
      token,
      refreshToken,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
