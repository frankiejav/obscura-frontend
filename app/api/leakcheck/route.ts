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

    // Check if LeakCheck is enabled in settings
    try {
      const settingsResult = await db.query('SELECT leak_check FROM settings WHERE id = 1')
      if (settingsResult.rows.length > 0) {
        const leakCheckSettings = settingsResult.rows[0].leak_check
        if (leakCheckSettings && !leakCheckSettings.enabled) {
          return NextResponse.json({ 
            error: 'LeakCheck is disabled in settings' 
          }, { status: 403 })
        }
      }
    } catch (error) {
      console.error('Error checking LeakCheck settings:', error)
      // Continue with API key check if settings check fails
    }

    // Get API key from environment variables
    const apiKey = process.env.LEAKCHECK_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'LeakCheck API key not configured in environment variables' }, { status: 500 })
    }

    // Call LeakCheck API
    const url = new URL('https://leakcheck.io/api/v2/query/' + encodeURIComponent(query))
    if (type && type !== 'auto') {
      url.searchParams.append('type', type)
    }

    const leakCheckResponse = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
    })

    if (!leakCheckResponse.ok) {
      const errorText = await leakCheckResponse.text()
      let errorMessage = `LeakCheck API error: ${leakCheckResponse.status}`
      
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorMessage
      } catch {
        errorMessage += ` - ${errorText}`
      }
      
      return NextResponse.json({ error: errorMessage }, { status: leakCheckResponse.status })
    }

    const result = await leakCheckResponse.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error('LeakCheck API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 