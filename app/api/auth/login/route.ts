import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/user-service"
import { signJWT } from "@/lib/jwt"
import { auditLogger } from "@/lib/audit-logger"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const user = await userService.verifyCredentials(email, password)
    if (!user) {
      await auditLogger.log({
        userId: null,
        action: "LOGIN_FAILED",
        resource: "auth",
        details: { email },
        ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
        userAgent: req.headers.get("user-agent") ?? "unknown",
      })
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const access = await signJWT({ userId: user.id, role: user.role, email: user.email })
    const refresh = await signJWT({ userId: user.id, type: "refresh" }, { expiresIn: "7d" })

    await auditLogger.log({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      resource: "auth",
      details: null,
      ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent: req.headers.get("user-agent") ?? "unknown",
    })

    return NextResponse.json({ user, token: access, refreshToken: refresh })
  } catch (err) {
    console.error("login error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
