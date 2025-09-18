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

    // Get an access token for the Management API
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

    if (!tokenResponse.ok) {
      return NextResponse.json({
        error: 'Failed to get Management API token',
        details: 'Check AUTH0_CLIENT_ID and AUTH0_CLIENT_SECRET are set correctly'
      }, { status: 500 })
    }

    const { access_token } = await tokenResponse.json()

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
