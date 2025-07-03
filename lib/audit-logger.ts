import { db } from "./database"

export interface AuditLogEntry {
  userId?: string
  action: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export const auditLogger = {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const query = `
        INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5)
      `

      await db.query(query, [
        entry.userId || null,
        entry.action,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.ipAddress || null,
        entry.userAgent || null,
      ])
    } catch (error) {
      console.error("Failed to log audit entry:", error)
      // Don't throw - audit logging shouldn't break the main flow
    }
  },

  async getRecentLogs(limit = 100): Promise<any[]> {
    const query = `
      SELECT 
        al.*,
        u.email as user_email,
        u.name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT $1
    `

    const result = await db.query(query, [limit])
    return result.rows
  },

  async getLogsByUser(userId: string, limit = 50): Promise<any[]> {
    const query = `
      SELECT * FROM audit_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `

    const result = await db.query(query, [userId, limit])
    return result.rows
  },
}

// Helper function for logging requests
export async function logRequest(entry: AuditLogEntry): Promise<void> {
  await auditLogger.log(entry)
}
