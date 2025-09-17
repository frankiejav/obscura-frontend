import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { getUserSubscription } from '@/lib/user-subscription'
import { AccountType, ACCOUNT_FEATURES } from '@/lib/account-types'

export async function GET(request: NextRequest) {
  try {
    // Try to get the session
    const session = await auth0.getSession(request)
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'Not authenticated. Please login at /api/auth/login',
      }, { status: 401 })
    }

    // Get subscription info
    const subscription = await getUserSubscription(request)
    
    return NextResponse.json({
      authenticated: true,
      user: {
        email: session.user.email,
        sub: session.user.sub,
        name: session.user.name,
      },
      subscription: subscription || {
        accountType: AccountType.FREE,
        status: 'none',
        message: 'No subscription data found - account needs initialization'
      },
      metadata: {
        app_metadata: session.user.app_metadata || {},
        user_metadata: session.user.user_metadata || {},
      },
      features: subscription ? ACCOUNT_FEATURES[subscription.accountType] : null,
    })
  } catch (error) {
    console.error('Error checking account status:', error)
    return NextResponse.json({
      authenticated: false,
      error: 'Failed to check authentication status',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

// Endpoint to self-upgrade account (for admin use)
export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession(request)
    
    if (!session) {
      return NextResponse.json({
        error: 'Not authenticated',
      }, { status: 401 })
    }

    const { accountType } = await request.json()
    
    // Validate account type
    const validTypes = ['free', 'starter', 'professional', 'enterprise']
    if (!validTypes.includes(accountType)) {
      return NextResponse.json({
        error: 'Invalid account type',
        validTypes,
      }, { status: 400 })
    }

    // Only allow self-upgrade for specific admin emails (add your email here)
    const adminEmails = [
      // Add your admin email here
      process.env.ADMIN_EMAIL,
      // You can add more admin emails as needed
    ].filter(Boolean)

    if (adminEmails.length === 0 || !adminEmails.includes(session.user.email)) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Only admins can self-upgrade accounts. Set ADMIN_EMAIL in environment variables.',
      }, { status: 403 })
    }

    // Import the Management Client
    const { ManagementClient } = require('auth0')
    
    const management = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN!,
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      scope: 'read:users update:users update:users_app_metadata',
    })

    // Update the user's metadata
    const updatedMetadata = {
      account_type: accountType,
      subscription: {
        status: 'active',
        startDate: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        paymentMethod: 'manual',
        notes: 'Self-provisioned by admin',
      },
    }

    await management.updateAppMetadata(
      { id: session.user.sub },
      updatedMetadata
    )

    return NextResponse.json({
      success: true,
      message: `Account upgraded to ${accountType}`,
      accountType,
      note: 'Please log out and log back in for changes to take effect',
    })
  } catch (error) {
    console.error('Error upgrading account:', error)
    return NextResponse.json({
      error: 'Failed to upgrade account',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
