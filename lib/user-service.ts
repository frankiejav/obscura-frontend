import { Pool } from "pg"
import * as bcrypt from "bcryptjs"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "client"
  is_active: boolean
  password_hash?: string
  created_at: Date
  updated_at: Date
  last_login?: Date
}

export interface CreateUserArgs {
  name: string
  email: string
  password: string
  role?: "admin" | "client"
}

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://obscura_user:obscura_password_dev@localhost:5432/obscura_labs",
})

async function hashPassword(password: string, rounds = 12) {
  return bcrypt.hash(password, rounds)
}

async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export const userService = {
  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query<User>(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [email])
    return rows[0] ?? null
  },

  async createUser({ name, email, password, role = "client" }: CreateUserArgs) {
    const passwordHash = await hashPassword(password)
    const { rows } = await pool.query<User>(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1,$2,$3,$4,true)
       RETURNING id,name,email,role,created_at`,
      [name, email, passwordHash, role],
    )
    return rows[0]
  },

  async verifyCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email)
    if (!user || !user.password_hash) return null
    const ok = await comparePassword(password, user.password_hash)
    if (!ok) return null

    await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id])
    // strip hash before returning
    const { password_hash, ...safe } = user
    return safe as User
  },
}
