import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, type } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required and must be a string' }, { status: 400 })
    }

    if (query.length < 3) {
      return NextResponse.json({ error: 'Query must be at least 3 characters long' }, { status: 400 })
    }

    // Check if database search is enabled in settings
    try {
      const settingsResult = await db.query('SELECT database_search FROM settings WHERE id = $1', ['00000000-0000-0000-0000-000000000001'])
      if (settingsResult.rows.length > 0) {
        const databaseSearchSettings = settingsResult.rows[0].database_search
        if (databaseSearchSettings && !databaseSearchSettings.enabled) {
          return NextResponse.json({ 
            error: 'Database search is disabled in settings' 
          }, { status: 403 })
        }
      }
    } catch (error) {
      console.error('Error checking database search settings:', error)
      // Continue with API key check if settings check fails
    }

    // Get API key from environment variables
    const apiKey = process.env.LEAKCHECK_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Database search API key not configured in environment variables' }, { status: 500 })
    }

    // Call external database search API
    const url = new URL('https://leakcheck.io/api/v2/query/' + encodeURIComponent(query))
    if (type && type !== 'auto') {
      url.searchParams.append('type', type)
    }

    const databaseSearchResponse = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
    })

    if (!databaseSearchResponse.ok) {
      const errorText = await databaseSearchResponse.text()
      let errorMessage = `Database search API error: ${databaseSearchResponse.status}`
      
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorMessage
      } catch {
        errorMessage += ` - ${errorText}`
      }
      
      return NextResponse.json({ error: errorMessage }, { status: databaseSearchResponse.status })
    }

    const result = await databaseSearchResponse.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Database search API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 