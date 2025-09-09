import { neon } from '@neondatabase/serverless';

// Get the database connection
const sql = neon(process.env.NEON!);

/**
 * Initialize database tables for monitoring
 */
export async function initializeMonitoringTables() {
  try {
    // Create monitoring_targets table
    await sql`
      CREATE TABLE IF NOT EXISTS monitoring_targets (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'domain', 'phone', 'username', 'ip')),
        value VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'scanning', 'found', 'clean', 'error')),
        breach_count INTEGER DEFAULT 0,
        last_scanned TIMESTAMP,
        auto_scan BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, type, value)
      )
    `;

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_monitoring_targets_user_id 
      ON monitoring_targets(user_id)
    `;

    // Create scan_results table
    await sql`
      CREATE TABLE IF NOT EXISTS scan_results (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        target_id UUID NOT NULL REFERENCES monitoring_targets(id) ON DELETE CASCADE,
        source VARCHAR(50) NOT NULL,
        breach_name VARCHAR(255) NOT NULL,
        breach_date DATE,
        data_types TEXT[],
        severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        details JSONB,
        found_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(target_id, breach_name, source)
      )
    `;

    // Create index for scan results
    await sql`
      CREATE INDEX IF NOT EXISTS idx_scan_results_target_id 
      ON scan_results(target_id)
    `;

    // Create notifications table for monitoring alerts
    await sql`
      CREATE TABLE IF NOT EXISTS monitoring_notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        target_id UUID REFERENCES monitoring_targets(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        severity VARCHAR(20),
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create index for notifications
    await sql`
      CREATE INDEX IF NOT EXISTS idx_monitoring_notifications_user_id 
      ON monitoring_notifications(user_id, read)
    `;

    console.log('Monitoring tables initialized successfully');
  } catch (error) {
    console.error('Error initializing monitoring tables:', error);
    throw error;
  }
}

/**
 * Get monitoring targets for a user
 */
export async function getUserMonitoringTargets(userId: string) {
  try {
    const targets = await sql`
      SELECT 
        t.*,
        COUNT(DISTINCT r.id) as result_count
      FROM monitoring_targets t
      LEFT JOIN scan_results r ON t.id = r.target_id
      WHERE t.user_id = ${userId}
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;
    return targets;
  } catch (error) {
    console.error('Error fetching monitoring targets:', error);
    return [];
  }
}

/**
 * Get scan results for a user's targets
 */
export async function getUserScanResults(userId: string) {
  try {
    const results = await sql`
      SELECT r.*, t.value as target_value, t.type as target_type
      FROM scan_results r
      INNER JOIN monitoring_targets t ON r.target_id = t.id
      WHERE t.user_id = ${userId}
      ORDER BY r.found_at DESC
    `;
    return results;
  } catch (error) {
    console.error('Error fetching scan results:', error);
    return [];
  }
}

/**
 * Add a new monitoring target
 */
export async function addMonitoringTarget(
  userId: string,
  type: string,
  value: string,
  autoScan: boolean = true
) {
  try {
    const [target] = await sql`
      INSERT INTO monitoring_targets (user_id, type, value, auto_scan)
      VALUES (${userId}, ${type}, ${value.toLowerCase().trim()}, ${autoScan})
      ON CONFLICT (user_id, type, value) DO NOTHING
      RETURNING *
    `;
    return target;
  } catch (error) {
    console.error('Error adding monitoring target:', error);
    throw error;
  }
}

/**
 * Delete a monitoring target
 */
export async function deleteMonitoringTarget(targetId: string, userId: string) {
  try {
    const [deleted] = await sql`
      DELETE FROM monitoring_targets
      WHERE id = ${targetId} AND user_id = ${userId}
      RETURNING id
    `;
    return deleted;
  } catch (error) {
    console.error('Error deleting monitoring target:', error);
    throw error;
  }
}

/**
 * Update monitoring target status
 */
export async function updateTargetStatus(
  targetId: string,
  status: string,
  breachCount?: number
) {
  try {
    const [updated] = await sql`
      UPDATE monitoring_targets
      SET 
        status = ${status},
        breach_count = COALESCE(${breachCount}, breach_count),
        last_scanned = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${targetId}
      RETURNING *
    `;
    return updated;
  } catch (error) {
    console.error('Error updating target status:', error);
    throw error;
  }
}

/**
 * Add scan result for a target
 */
export async function addScanResult(
  targetId: string,
  source: string,
  breachName: string,
  breachDate: Date | null,
  dataTypes: string[],
  severity: string,
  details?: any
) {
  try {
    const [result] = await sql`
      INSERT INTO scan_results (
        target_id, source, breach_name, breach_date, 
        data_types, severity, details
      )
      VALUES (
        ${targetId}, ${source}, ${breachName}, ${breachDate},
        ${dataTypes}, ${severity}, ${details ? JSON.stringify(details) : null}
      )
      ON CONFLICT (target_id, breach_name, source) 
      DO UPDATE SET 
        breach_date = EXCLUDED.breach_date,
        data_types = EXCLUDED.data_types,
        severity = EXCLUDED.severity,
        details = EXCLUDED.details,
        found_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    return result;
  } catch (error) {
    console.error('Error adding scan result:', error);
    throw error;
  }
}

/**
 * Add monitoring notification
 */
export async function addMonitoringNotification(
  userId: string,
  targetId: string | null,
  type: string,
  title: string,
  message: string,
  severity?: string
) {
  try {
    const [notification] = await sql`
      INSERT INTO monitoring_notifications (
        user_id, target_id, type, title, message, severity
      )
      VALUES (
        ${userId}, ${targetId}, ${type}, ${title}, ${message}, ${severity}
      )
      RETURNING *
    `;
    return notification;
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, unreadOnly: boolean = false) {
  try {
    let query = sql`
      SELECT * FROM monitoring_notifications
      WHERE user_id = ${userId}
    `;
    
    if (unreadOnly) {
      query = sql`
        SELECT * FROM monitoring_notifications
        WHERE user_id = ${userId} AND read = false
      `;
    }
    
    const notifications = await sql`
      SELECT * FROM monitoring_notifications
      WHERE user_id = ${userId} ${unreadOnly ? sql`AND read = false` : sql``}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const [updated] = await sql`
      UPDATE monitoring_notifications
      SET read = true
      WHERE id = ${notificationId} AND user_id = ${userId}
      RETURNING id
    `;
    return updated;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export default sql;


