import bcrypt from "bcrypt"
import { db } from "./database"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "client"
  is_active: boolean
  created_at: Date
  updated_at: Date
  last_login?: Date
}

export interface CreateUserData {
  email: string
  name: string
  password: string
  role?: "admin" | "client"
}

export const userService = {
  // Create a new user
  async createUser(userData: CreateUserData): Promise<User> {
    const { email, name, password, role = "client" } = userData

    // Hash password
    const passwordHash = await bcrypt.hash(password, Number.parseInt(process.env.BCRYPT_ROUNDS || "12"))

    const query = `
      INSERT INTO users (email, name, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role, is_active, created_at, updated_at
    `

    const result = await db.query(query, [email, name, passwordHash, role])
    return result.rows[0]
  },

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, role, is_active, created_at, updated_at, last_login
      FROM users 
      WHERE email = $1 AND is_active = true
    `

    const result = await db.query(query, [email])
    return result.rows[0] || null
  },

  // Find user by ID
  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, role, is_active, created_at, updated_at, last_login
      FROM users 
      WHERE id = $1 AND is_active = true
    `

    const result = await db.query(query, [id])
    return result.rows[0] || null
  },

  // Verify user password
  async verifyPassword(email: string, password: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, role, is_active, password_hash, created_at, updated_at, last_login
      FROM users 
      WHERE email = $1 AND is_active = true
    `

    const result = await db.query(query, [email])
    const user = result.rows[0]

    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return null

    // Update last login
    await this.updateLastLogin(user.id)

    // Remove password_hash from returned user
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  },

  // Update last login timestamp
  async updateLastLogin(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = $1
    `

    await db.query(query, [userId])
  },

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    const query = `
      SELECT id, email, name, role, is_active, created_at, updated_at, last_login
      FROM users 
      ORDER BY created_at DESC
    `

    const result = await db.query(query)
    return result.rows
  },

  // Update user
  async updateUser(id: string, updates: Partial<CreateUserData>): Promise<User | null> {
    const fields = []
    const values = []
    let paramCount = 1

    if (updates.name) {
      fields.push(`name = $${paramCount}`)
      values.push(updates.name)
      paramCount++
    }

    if (updates.email) {
      fields.push(`email = $${paramCount}`)
      values.push(updates.email)
      paramCount++
    }

    if (updates.role) {
      fields.push(`role = $${paramCount}`)
      values.push(updates.role)
      paramCount++
    }

    if (updates.password) {
      const passwordHash = await bcrypt.hash(updates.password, Number.parseInt(process.env.BCRYPT_ROUNDS || "12"))
      fields.push(`password_hash = $${paramCount}`)
      values.push(passwordHash)
      paramCount++
    }

    if (fields.length === 0) return null

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const query = `
      UPDATE users 
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING id, email, name, role, is_active, created_at, updated_at, last_login
    `

    const result = await db.query(query, values)
    return result.rows[0] || null
  },

  // Deactivate user (soft delete)
  async deactivateUser(id: string): Promise<boolean> {
    const query = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `

    const result = await db.query(query, [id])
    return result.rowCount > 0
  },
}
