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

    const { newEmail } = await request.json()
    
    if (!newEmail || !newEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const userId = session.user.sub as string
    
    // Call Auth0 Management API to update email
    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getManagementApiToken()}`,
        },
        body: JSON.stringify({
          email: newEmail,
          email_verified: false, // Require email verification
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.message || 'Failed to update email' },
        { status: response.status }
      )
    }

    // Send verification email
    await sendVerificationEmail(userId, newEmail)

    return NextResponse.json({
      success: true,
      message: 'Email updated successfully. Please check your inbox to verify your new email address.',
    })
  } catch (error) {
    console.error('Error changing email:', error)
    return NextResponse.json(
      { error: 'Failed to change email' },
      { status: 500 }
    )
  }
}

// Helper function to get Auth0 Management API token
async function getManagementApiToken(): Promise<string> {
  const response = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    }
  )

  const data = await response.json()
  return data.access_token
}

// Helper function to send verification email
async function sendVerificationEmail(userId: string, email: string): Promise<void> {
  const token = await getManagementApiToken()
  
  await fetch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/jobs/verification-email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        client_id: process.env.AUTH0_CLIENT_ID,
      }),
    }
  )
}
