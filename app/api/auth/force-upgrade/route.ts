import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'

// TEMPORARY ROUTE - Remove this after upgrading your account
export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await auth0.getSession(request)
    
    if (!session) {
      return NextResponse.json({
        error: 'Not authenticated. Please login first at /api/auth/login',
      }, { status: 401 })
    }

    // Verify Auth0 configuration
    if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID || !process.env.AUTH0_CLIENT_SECRET) {
      return NextResponse.json({
        error: 'Missing Auth0 configuration',
        missing: {
          domain: !process.env.AUTH0_DOMAIN,
          clientId: !process.env.AUTH0_CLIENT_ID,
          clientSecret: !process.env.AUTH0_CLIENT_SECRET,
        }
      }, { status: 500 })
    }

    // Get an access token for the Management API
    console.log('Getting Management API token from:', `https://${process.env.AUTH0_DOMAIN}/oauth/token`)
    
    const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`
      })
    })

    const tokenText = await tokenResponse.text()
    
    if (!tokenResponse.ok) {
      console.error('Token request failed:', tokenText)
      return NextResponse.json({
        error: 'Failed to get Management API token',
        status: tokenResponse.status,
        response: tokenText,
        hint: 'Ensure your Auth0 Machine-to-Machine app has the Management API authorized',
        domain: process.env.AUTH0_DOMAIN
      }, { status: 500 })
    }

    let access_token
    try {
      const tokenData = JSON.parse(tokenText)
      access_token = tokenData.access_token
      if (!access_token) {
        throw new Error('No access token in response')
      }
    } catch (e) {
      return NextResponse.json({
        error: 'Invalid token response',
        response: tokenText
      }, { status: 500 })
    }

    // Force upgrade to enterprise
    const updatedMetadata = {
      account_type: 'enterprise',
      subscription: {
        status: 'active',
        startDate: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        paymentMethod: 'manual',
        notes: 'Force upgraded via emergency endpoint',
      },
    }

    const updateResponse = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(session.user.sub)}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_metadata: updatedMetadata
        })
      }
    )

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      return NextResponse.json({
        error: 'Failed to update user metadata',
        details: errorText,
        hint: 'Make sure your Auth0 application has the Management API authorized with update:users_app_metadata scope'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Account FORCE UPGRADED to ENTERPRISE!',
      user: session.user.email,
      userId: session.user.sub,
      newAccountType: 'enterprise',
      important: '⚠️ IMPORTANT: Log out and log back in NOW for changes to take effect!',
      logoutUrl: '/api/auth/logout',
      note: 'DELETE this endpoint (/app/api/auth/force-upgrade) after use for security!'
    })

  } catch (error) {
    console.error('Force upgrade error:', error)
    return NextResponse.json({
      error: 'Failed to force upgrade',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
