import { neon } from '@neondatabase/serverless'

// Create Neon database connection lazily
function getDb() {
  // Check for NEON env var (from .env) or DATABASE_URL (common Vercel convention)
  const connectionString = process.env.NEON || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn('NEON/DATABASE_URL is not set. Database operations will fail.')
    // Return a mock function during build time
    return async () => []
  }
  return neon(connectionString)
}

// Monitoring targets functions
export async function getUserMonitoringTargets(userId: string) {
  try {
    const sql = getDb()
    const targets = await sql`
      SELECT * FROM monitoring_targets 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return targets
  } catch (error) {
    console.error('Error fetching monitoring targets:', error)
    throw error
  }
}

export async function addMonitoringTarget(
  userId: string, 
  type: string, 
  value: string,
  autoScan: boolean = true
) {
  try {
    const sql = getDb()
    const result = await sql`
      INSERT INTO monitoring_targets (user_id, type, value, auto_scan)
      VALUES (${userId}, ${type}, ${value}, ${autoScan})
      ON CONFLICT (user_id, type, value) 
      DO UPDATE SET 
        auto_scan = ${autoScan},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('Error adding monitoring target:', error)
    throw error
  }
}

export async function updateTargetStatus(
  targetId: string,
  status: string,
  breachCount?: number
) {
  try {
    const sql = getDb()
    const updates: any = { 
      status,
      last_scanned: new Date().toISOString()
    }
    
    if (breachCount !== undefined) {
      updates.breach_count = breachCount
    }

    const result = await sql`
      UPDATE monitoring_targets
      SET 
        status = ${status},
        last_scanned = CURRENT_TIMESTAMP,
        breach_count = COALESCE(${breachCount}, breach_count),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${targetId}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('Error updating target status:', error)
    throw error
  }
}

export async function deleteMonitoringTarget(targetId: string, userId: string) {
  try {
    const sql = getDb()
    const result = await sql`
      DELETE FROM monitoring_targets
      WHERE id = ${targetId} AND user_id = ${userId}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('Error deleting monitoring target:', error)
    throw error
  }
}

// Scan results functions
export async function getUserScanResults(userId: string) {
  try {
    const sql = getDb()
    const results = await sql`
      SELECT sr.*, mt.type, mt.value, mt.status as target_status
      FROM scan_results sr
      JOIN monitoring_targets mt ON sr.target_id = mt.id
      WHERE mt.user_id = ${userId}
      ORDER BY sr.found_at DESC
    `
    return results
  } catch (error) {
    console.error('Error fetching scan results:', error)
    throw error
  }
}

export async function addScanResult(
  targetId: string,
  source: string,
  breachName: string,
  breachDate: Date | null,
  dataTypes: string[],
  severity: string,
  details: any
) {
  try {
    const sql = getDb()
    const result = await sql`
      INSERT INTO scan_results (
        target_id, 
        source, 
        breach_name, 
        breach_date, 
        data_types, 
        severity, 
        details
      )
      VALUES (
        ${targetId}, 
        ${source}, 
        ${breachName}, 
        ${breachDate}, 
        ${dataTypes}, 
        ${severity}, 
        ${JSON.stringify(details)}
      )
      ON CONFLICT (target_id, breach_name, source) 
      DO UPDATE SET 
        breach_date = ${breachDate},
        data_types = ${dataTypes},
        severity = ${severity},
        details = ${JSON.stringify(details)},
        found_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('Error adding scan result:', error)
    throw error
  }
}

export async function getScanResultsForTarget(targetId: string) {
  try {
    const sql = getDb()
    const results = await sql`
      SELECT * FROM scan_results
      WHERE target_id = ${targetId}
      ORDER BY found_at DESC
    `
    return results
  } catch (error) {
    console.error('Error fetching scan results for target:', error)
    throw error
  }
}

// Notifications functions
export async function addMonitoringNotification(
  userId: string,
  targetId: string | null,
  type: string,
  title: string,
  message: string,
  severity: string = 'info'
) {
  try {
    const sql = getDb()
    const result = await sql`
      INSERT INTO monitoring_notifications (
        user_id, 
        target_id, 
        type, 
        title, 
        message, 
        severity
      )
      VALUES (
        ${userId}, 
        ${targetId}, 
        ${type}, 
        ${title}, 
        ${message}, 
        ${severity}
      )
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('Error adding monitoring notification:', error)
    throw error
  }
}

export async function getUserNotifications(userId: string, unreadOnly: boolean = false) {
  try {
    const sql = getDb()
    let query
    if (unreadOnly) {
      query = sql`
        SELECT * FROM monitoring_notifications
        WHERE user_id = ${userId} AND read = false
        ORDER BY created_at DESC
      `
    } else {
      query = sql`
        SELECT * FROM monitoring_notifications
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 100
      `
    }
    return await query
  } catch (error) {
    console.error('Error fetching user notifications:', error)
    throw error
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const sql = getDb()
    const result = await sql`
      UPDATE monitoring_notifications
      SET read = true
      WHERE id = ${notificationId} AND user_id = ${userId}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

// Helper function to clean up old scan results
export async function cleanupOldScanResults(daysToKeep: number = 90) {
  try {
    const sql = getDb()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    
    const result = await sql`
      DELETE FROM scan_results
      WHERE found_at < ${cutoffDate.toISOString()}
    `
    return result
  } catch (error) {
    console.error('Error cleaning up old scan results:', error)
    throw error
  }
}
