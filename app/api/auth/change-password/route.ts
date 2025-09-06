import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = session.user.email as string
    
    // Trigger password reset email through Auth0
    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          email: userEmail,
          connection: process.env.AUTH0_CONNECTION || 'Username-Password-Authentication',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Auth0 password reset error:', error)
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox.',
    })
  } catch (error) {
    console.error('Error initiating password reset:', error)
    return NextResponse.json(
      { error: 'Failed to initiate password reset' },
      { status: 500 }
    )
  }
}
