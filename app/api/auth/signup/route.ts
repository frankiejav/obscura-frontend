import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/user-service"
import { auditLogger } from "@/lib/audit-logger"
import { signJWT } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()
    const role = "client" // Force all signups to be client role

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await userService.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create user
    const user = await userService.createUser({
      name,
      email,
      password,
      role: "client", // Always create as client
    })

    // Generate tokens
    const token = await signJWT({ userId: user.id, email: user.email, role: user.role })
    const refreshToken = await signJWT({ userId: user.id, type: "refresh" }, { expiresIn: "7d" })

    // Log the signup
    await auditLogger.log({
      userId: user.id,
      action: "USER_SIGNUP",
      resource: "auth",
      details: { email: user.email, role: "client", note: "Auto-assigned client role" },
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    // Return user data and tokens (excluding sensitive info)
    const { id, email: userEmail, name: userName, role: userRole, created_at } = user

    return NextResponse.json({
      user: {
        id,
        email: userEmail,
        name: userName,
        role: userRole,
        created_at,
      },
      token,
      refreshToken,
    })
  } catch (error) {
    console.error("Signup error:", error)

    // Log the failed attempt
    await auditLogger.log({
      userId: null,
      action: "USER_SIGNUP_FAILED",
      resource: "auth",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
