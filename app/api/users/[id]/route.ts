import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyJWT } from "@/lib/jwt"
import bcrypt from "bcryptjs"

// Lazy load database connection
function getDb() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set. Database operations will fail.')
    return async () => []
  }
  return neon(process.env.DATABASE_URL)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { name, email, role, password } = await request.json()
    const userId = params.id

    // Get database connection
    const sql = getDb()

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if email is being changed and if it's already taken
    if (email) {
      const emailCheck = await sql`
        SELECT id FROM users WHERE email = ${email} AND id != ${userId}
      `
      if (emailCheck.length > 0) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 })
      }
    }

    // Build update query
    let updateQuery = sql`UPDATE users SET `
    const updates = []

    if (name) {
      updates.push(sql`name = ${name}`)
    }
    if (email) {
      updates.push(sql`email = ${email}`)
    }
    if (role) {
      updates.push(sql`role = ${role}`)
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 12)
      updates.push(sql`password_hash = ${passwordHash}`)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    // Execute update
    await sql`
      UPDATE users 
      SET ${sql.join(updates, sql`, `)}
      WHERE id = ${userId}
    `

    // Fetch updated user
    const updatedUser = await sql`
      SELECT id, name, email, role, created_at, last_login, is_active
      FROM users 
      WHERE id = ${userId}
    `

    return NextResponse.json({ user: updatedUser[0] })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const userId = params.id

    // Get database connection
    const sql = getDb()

    // Check if user exists
    const existingUser = await sql`
      SELECT id, name FROM users WHERE id = ${userId}
    `

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent admin from deleting themselves
    if (userId === payload.sub) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Soft delete by setting is_active to false
    await sql`
      UPDATE users 
      SET is_active = false 
      WHERE id = ${userId}
    `

    return NextResponse.json({ 
      message: "User deleted successfully",
      user: existingUser[0]
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 