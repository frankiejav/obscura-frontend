/**
 * User Subscription Management Service
 * Handles user account types, subscription status, and Auth0 metadata
 */

import { auth0 } from '@/lib/auth0'
import { AccountType, ACCOUNT_FEATURES, hasFeature, Feature, getLimit } from '@/lib/account-types'
import { NextRequest } from 'next/server'

export interface UserSubscription {
  userId: string
  accountType: AccountType
  status: 'active' | 'trial' | 'expired' | 'cancelled'
  startDate: Date
  endDate?: Date
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  paymentMethod?: 'stripe' | 'crypto'
  features: string[]
  limits: {
    lookupsToday: number
    lookupsThisMonth: number
    apiCreditsUsed: number
    monitoringTargets: number
  }
}

/**
 * Get user subscription data from Auth0 metadata
 */
export async function getUserSubscription(request: NextRequest): Promise<UserSubscription | null> {
  try {
    const session = await auth0.getSession(request)
    
    if (!session) {
      return null
    }

    const userId = session.user.sub
    const userMetadata = session.user.user_metadata || {}
    const appMetadata = session.user.app_metadata || {}

    // Check for bypass cookie FIRST
    const bypassCookie = request.cookies.get('account_bypass')
    let accountType: AccountType
    
    if (bypassCookie?.value === 'enterprise') {
      console.log('BYPASS ACTIVE: Using enterprise account type')
      accountType = AccountType.ENTERPRISE
    } else {
      // Default to FREE if no subscription data
      accountType = (appMetadata.account_type as AccountType) || AccountType.FREE
    }
    const subscriptionData = appMetadata.subscription || {}
    
    // Get feature list for the account type
    const accountFeatures = ACCOUNT_FEATURES[accountType]
    const enabledFeatures = Object.entries(accountFeatures.features)
      .filter(([_, config]) => config.enabled)
      .map(([feature]) => feature)

    return {
      userId,
      accountType,
      status: subscriptionData.status || 'active',
      startDate: subscriptionData.startDate ? new Date(subscriptionData.startDate) : new Date(),
      endDate: subscriptionData.endDate ? new Date(subscriptionData.endDate) : undefined,
      stripeCustomerId: subscriptionData.stripeCustomerId,
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
      paymentMethod: subscriptionData.paymentMethod,
      features: enabledFeatures,
      limits: {
        lookupsToday: userMetadata.lookupsToday || 0,
        lookupsThisMonth: userMetadata.lookupsThisMonth || 0,
        apiCreditsUsed: userMetadata.apiCreditsUsed || 0,
        monitoringTargets: userMetadata.monitoringTargets || 0,
      },
    }
  } catch (error) {
    console.error('Error fetching user subscription:', error)
    return null
  }
}

/**
 * Update user subscription in Auth0
 */
export async function updateUserSubscription(
  userId: string,
  accountType: AccountType,
  subscriptionData?: Partial<{
    status: string
    startDate: Date
    endDate?: Date
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    paymentMethod?: 'stripe' | 'crypto'
  }>
): Promise<boolean> {
  try {
    const managementClient = await getAuth0ManagementClient()
    
    await managementClient.updateUserMetadata(
      { id: userId },
      {
        app_metadata: {
          account_type: accountType,
          subscription: {
            ...subscriptionData,
            updated_at: new Date().toISOString(),
          },
        },
      }
    )
    
    return true
  } catch (error) {
    console.error('Error updating user subscription:', error)
    return false
  }
}

/**
 * Check if user has access to a specific feature
 */
export async function userHasFeature(
  request: NextRequest,
  feature: Feature
): Promise<boolean> {
  const subscription = await getUserSubscription(request)
  
  if (!subscription) {
    return false
  }
  
  return hasFeature(subscription.accountType, feature)
}

/**
 * Check if user has reached their limit
 */
export async function checkUserLimit(
  request: NextRequest,
  limitType: 'lookups' | 'apiCredits' | 'monitoringTargets'
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const subscription = await getUserSubscription(request)
  
  if (!subscription) {
    return { allowed: false, remaining: 0, limit: 0 }
  }
  
  const accountFeatures = ACCOUNT_FEATURES[subscription.accountType]
  
  switch (limitType) {
    case 'lookups': {
      const dailyLimit = accountFeatures.limits.lookupsPerDay
      const monthlyLimit = accountFeatures.limits.lookupsPerMonth
      
      if (dailyLimit && dailyLimit !== -1) {
        const remaining = dailyLimit - subscription.limits.lookupsToday
        return {
          allowed: remaining > 0,
          remaining: Math.max(0, remaining),
          limit: dailyLimit,
        }
      }
      
      if (monthlyLimit && monthlyLimit !== -1) {
        const remaining = monthlyLimit - subscription.limits.lookupsThisMonth
        return {
          allowed: remaining > 0,
          remaining: Math.max(0, remaining),
          limit: monthlyLimit,
        }
      }
      
      return { allowed: true, remaining: -1, limit: -1 }
    }
    
    case 'apiCredits': {
      const limit = accountFeatures.limits.apiCreditsPerMonth || 0
      if (limit === -1) {
        return { allowed: true, remaining: -1, limit: -1 }
      }
      
      const remaining = limit - subscription.limits.apiCreditsUsed
      return {
        allowed: remaining > 0,
        remaining: Math.max(0, remaining),
        limit,
      }
    }
    
    case 'monitoringTargets': {
      const limit = accountFeatures.limits.maxMonitoringTargets || 0
      if (limit === -1) {
        return { allowed: true, remaining: -1, limit: -1 }
      }
      
      const remaining = limit - subscription.limits.monitoringTargets
      return {
        allowed: remaining > 0,
        remaining: Math.max(0, remaining),
        limit,
      }
    }
    
    default:
      return { allowed: false, remaining: 0, limit: 0 }
  }
}

/**
 * Increment usage counter
 */
export async function incrementUsage(
  userId: string,
  usageType: 'lookups' | 'apiCredits',
  amount: number = 1
): Promise<void> {
  try {
    const managementClient = await getAuth0ManagementClient()
    const user = await managementClient.getUser({ id: userId })
    const metadata = user.user_metadata || {}
    
    const today = new Date().toDateString()
    const thisMonth = new Date().toISOString().slice(0, 7)
    
    // Reset daily counter if it's a new day
    if (metadata.lastLookupDate !== today) {
      metadata.lookupsToday = 0
      metadata.lastLookupDate = today
    }
    
    // Reset monthly counter if it's a new month
    if (metadata.lastLookupMonth !== thisMonth) {
      metadata.lookupsThisMonth = 0
      metadata.apiCreditsUsed = 0
      metadata.lastLookupMonth = thisMonth
    }
    
    // Increment the appropriate counter
    if (usageType === 'lookups') {
      metadata.lookupsToday = (metadata.lookupsToday || 0) + amount
      metadata.lookupsThisMonth = (metadata.lookupsThisMonth || 0) + amount
    } else if (usageType === 'apiCredits') {
      metadata.apiCreditsUsed = (metadata.apiCreditsUsed || 0) + amount
    }
    
    await managementClient.updateUserMetadata(
      { id: userId },
      { user_metadata: metadata }
    )
  } catch (error) {
    console.error('Error incrementing usage:', error)
  }
}

/**
 * Get Auth0 Management API Client
 */
async function getAuth0ManagementClient() {
  const { ManagementClient } = require('auth0')
  
  return new ManagementClient({
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    scope: 'read:users update:users update:users_app_metadata',
  })
}

/**
 * Handle post-payment subscription update
 */
export async function handlePaymentSuccess(
  userId: string,
  accountType: AccountType,
  paymentDetails: {
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    paymentMethod: 'stripe' | 'crypto'
  }
): Promise<void> {
  await updateUserSubscription(userId, accountType, {
    status: 'active',
    startDate: new Date(),
    ...paymentDetails,
  })
}
