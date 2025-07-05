import { NextRequest, NextResponse } from 'next/server'

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

    // Get API key from environment variables
    const apiKey = process.env.LEAKCHECK_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'LeakCheck API key not configured in environment variables' }, { status: 500 })
    }

    // Check if LeakCheck is enabled via settings
    const settingsResponse = await fetch(`${request.nextUrl.origin}/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            settings {
              leakCheck {
                enabled
              }
            }
          }
        `,
      }),
    })

    if (!settingsResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    const settingsData = await settingsResponse.json()
    const leakCheckSettings = settingsData.data?.settings?.leakCheck

    if (!leakCheckSettings?.enabled) {
      return NextResponse.json({ error: 'LeakCheck API is not enabled' }, { status: 403 })
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