/**
 * Feature Access Guards
 * Middleware and utilities for enforcing feature access based on account type
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserSubscription, userHasFeature, checkUserLimit, incrementUsage } from '@/lib/user-subscription'
import { Feature, AccountType } from '@/lib/account-types'

export interface FeatureGuardOptions {
  feature?: Feature
  requireAccountType?: AccountType[]
  checkLimit?: 'lookups' | 'apiCredits' | 'monitoringTargets'
  incrementUsage?: 'lookups' | 'apiCredits'
}

/**
 * Middleware to check feature access
 */
export async function withFeatureGuard(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: FeatureGuardOptions = {}
): Promise<(request: NextRequest) => Promise<NextResponse>> {
  return async (request: NextRequest) => {
    try {
      const subscription = await getUserSubscription(request)
      
      // Check if user is authenticated
      if (!subscription) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      // Check specific feature access
      if (options.feature && !await userHasFeature(request, options.feature)) {
        return NextResponse.json(
          {
            error: 'Feature not available',
            message: `This feature requires a higher subscription tier`,
            requiredFeature: options.feature,
            currentPlan: subscription.accountType,
          },
          { status: 403 }
        )
      }
      
      // Check account type requirements
      if (options.requireAccountType && !options.requireAccountType.includes(subscription.accountType)) {
        return NextResponse.json(
          {
            error: 'Insufficient permissions',
            message: `This action requires one of: ${options.requireAccountType.join(', ')}`,
            currentPlan: subscription.accountType,
          },
          { status: 403 }
        )
      }
      
      // Check usage limits
      if (options.checkLimit) {
        const limitCheck = await checkUserLimit(request, options.checkLimit)
        
        if (!limitCheck.allowed) {
          return NextResponse.json(
            {
              error: 'Limit exceeded',
              message: `You have reached your ${options.checkLimit} limit`,
              limit: limitCheck.limit,
              used: limitCheck.limit - limitCheck.remaining,
              remaining: 0,
            },
            { status: 429 }
          )
        }
        
        // Add limit info to response headers
        const response = await handler(request)
        response.headers.set('X-RateLimit-Limit', limitCheck.limit.toString())
        response.headers.set('X-RateLimit-Remaining', limitCheck.remaining.toString())
        
        // Increment usage if successful
        if (options.incrementUsage && response.status < 400) {
          await incrementUsage(subscription.userId, options.incrementUsage)
        }
        
        return response
      }
      
      // Call the original handler
      const response = await handler(request)
      
      // Increment usage if specified (and no limit check was done)
      if (options.incrementUsage && !options.checkLimit && response.status < 400) {
        await incrementUsage(subscription.userId, options.incrementUsage)
      }
      
      return response
    } catch (error) {
      console.error('Feature guard error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Create a protected API route handler
 */
export function protectedRoute(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: FeatureGuardOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const guardedHandler = await withFeatureGuard(handler, options)
    return guardedHandler(request)
  }
}

/**
 * Check multiple features at once
 */
export async function checkFeatures(
  request: NextRequest,
  features: Feature[]
): Promise<Record<Feature, boolean>> {
  const result: Record<Feature, boolean> = {} as any
  
  for (const feature of features) {
    result[feature] = await userHasFeature(request, feature)
  }
  
  return result
}

/**
 * Get feature access error message
 */
export function getFeatureErrorMessage(
  feature: Feature,
  currentPlan: AccountType
): string {
  const messages: Record<Feature, string> = {
    [Feature.DASHBOARD_ACCESS]: 'Dashboard access requires a subscription',
    [Feature.SEARCH]: 'Search functionality requires a subscription',
    [Feature.DATA_EXPORT]: 'Data export requires a Starter plan or higher',
    [Feature.CREDENTIAL_MONITORING]: 'Credential monitoring requires a Professional plan or higher',
    [Feature.API_ACCESS]: 'API access requires a Professional plan or higher',
    [Feature.REALTIME_FEEDS]: 'Real-time feeds require an Enterprise plan',
    [Feature.CUSTOM_ANALYTICS]: 'Custom analytics require an Enterprise plan',
    [Feature.USER_MANAGEMENT]: 'User management requires a Professional plan or higher',
    [Feature.TEAM_COLLABORATION]: 'Team collaboration requires a Professional plan or higher',
    [Feature.PRIORITY_SUPPORT]: 'Priority support requires a Professional plan or higher',
    [Feature.DEDICATED_SUPPORT]: 'Dedicated support requires an Enterprise plan',
  }
  
  return messages[feature] || `This feature is not available in your current plan (${currentPlan})`
}
