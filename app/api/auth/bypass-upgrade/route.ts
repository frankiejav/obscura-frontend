import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { cookies } from 'next/headers'

// EMERGENCY BYPASS - This creates a fake enterprise session
export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth0.getSession(request)
    
    if (!session) {
      return NextResponse.json({
        error: 'Not authenticated. Please login first at /api/auth/login',
      }, { status: 401 })
    }

    // Create a modified session with enterprise account type
    const modifiedSession = {
      ...session,
      user: {
        ...session.user,
        app_metadata: {
          ...session.user.app_metadata,
          account_type: 'enterprise',
          subscription: {
            status: 'active',
            startDate: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            paymentMethod: 'bypass',
            notes: 'Emergency bypass - temporary'
          }
        }
      }
    }

    // Store the modified session in cookies
    const response = NextResponse.json({
      success: true,
      message: 'BYPASS ACTIVATED - Enterprise access granted temporarily',
      user: session.user.email,
      warning: '⚠️ This is a temporary bypass. The real solution is to fix Auth0 Management API access.',
      accountType: 'enterprise',
      note: 'You now have enterprise access. Try searching now!',
      important: 'This bypass will last until you log out. To make it permanent, you need to fix the Auth0 Management API configuration.'
    })

    // Set a bypass cookie that the middleware can check
    response.cookies.set('account_bypass', 'enterprise', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response

  } catch (error) {
    console.error('Bypass error:', error)
    return NextResponse.json({
      error: 'Failed to activate bypass',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
