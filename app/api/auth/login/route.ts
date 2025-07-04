import { type NextRequest, NextResponse } from "next/server"
import { signJWT } from "@/lib/jwt"
import { logRequest } from "@/lib/audit-logger"

// Mock user database
const users = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123", // In production, use hashed passwords
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "client@example.com",
    password: "client123",
    name: "Client User",
    role: "client",
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt:", { email, password }) // Debug log

    // Find user
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) {
      console.log("User not found or password mismatch") // Debug log
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log("User found:", user) // Debug log

    // Create tokens
    const token = await signJWT(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      "15m", // 15 minutes
    )

    const refreshToken = await signJWT(
      {
        sub: user.id,
        type: "refresh",
      },
      "7d", // 7 days
    )

    // Log the login
    await logRequest({
      userId: user.id,
      action: "login",
      details: {
        ip: request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    })

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
