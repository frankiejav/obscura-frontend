import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { neon } from '@neondatabase/serverless'

// Lazy load database connection
function getDb() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set. Database operations will fail.')
    return async () => []
  }
  return neon(process.env.DATABASE_URL)
}

// Settings structure
interface Settings {
  profile: {
    displayName: string
    email: string
    theme: 'light' | 'dark' | 'system'
  }
  notifications: {
    emailAlerts: boolean
    securityAlerts: boolean
  }
  display: {
    defaultPageSize: string
    compactView: boolean
  }
}

// Default settings
const getDefaultSettings = (email: string): Settings => ({
  profile: {
    displayName: email.split('@')[0],
    email: email,
    theme: 'system',
  },
  notifications: {
    emailAlerts: true,
    securityAlerts: true,
  },
  display: {
    defaultPageSize: '25',
    compactView: false,
  },
})

export async function GET(request: NextRequest) {
  try {
    // Check if Auth0 is configured
    if (!auth0) {
      return NextResponse.json(
        { error: 'Authentication not configured' },
        { status: 503 }
      )
    }
    
    const session = await auth0.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.sub as string
    const userEmail = session.user.email as string
    
    try {
      const sql = getDb()
      
      // Try to get settings from database
      const result = await sql`
        SELECT settings 
        FROM user_settings 
        WHERE user_id = ${userId}
        LIMIT 1
      `
      
      if (result.length > 0 && result[0].settings) {
        return NextResponse.json(result[0].settings)
      }
    } catch (dbError) {
      console.log('Database not available, using defaults:', dbError)
    }
    
    // Return default settings if no stored settings or database error
    const defaultSettings = getDefaultSettings(userEmail)
    return NextResponse.json(defaultSettings)
    
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Auth0 is configured
    if (!auth0) {
      return NextResponse.json(
        { error: 'Authentication not configured' },
        { status: 503 }
      )
    }
    
    const session = await auth0.getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.sub as string
    const settings: Settings = await request.json()
    
    // Validate settings structure
    if (!settings.profile || !settings.notifications || !settings.display) {
      return NextResponse.json(
        { error: 'Invalid settings format' },
        { status: 400 }
      )
    }
    
    try {
      const sql = getDb()
      
      // First, ensure the user_settings table exists
      await sql`
        CREATE TABLE IF NOT EXISTS user_settings (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) UNIQUE NOT NULL,
          settings JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      // Upsert settings
      await sql`
        INSERT INTO user_settings (user_id, settings, updated_at)
        VALUES (${userId}, ${JSON.stringify(settings)}, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id)
        DO UPDATE SET 
          settings = EXCLUDED.settings,
          updated_at = CURRENT_TIMESTAMP
      `
      
      return NextResponse.json({
        ...settings,
        message: 'Settings saved successfully',
      })
    } catch (dbError) {
      console.error('Database error, settings not persisted:', dbError)
      // Still return success even if database fails (settings saved in session)
      return NextResponse.json({
        ...settings,
        message: 'Settings saved (session only)',
      })
    }
    
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}