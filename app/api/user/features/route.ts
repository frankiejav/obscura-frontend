import { NextRequest, NextResponse } from 'next/server'
import { getUserSubscription } from '@/lib/user-subscription'
import { ACCOUNT_FEATURES, Feature } from '@/lib/account-types'

export async function GET(request: NextRequest) {
  try {
    const subscription = await getUserSubscription(request)
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const accountFeatures = ACCOUNT_FEATURES[subscription.accountType]
    
    // Convert feature configuration to boolean map
    const featuresMap: Record<Feature, boolean> = {} as any
    for (const [feature, config] of Object.entries(accountFeatures.features)) {
      featuresMap[feature as Feature] = config.enabled
    }
    
    return NextResponse.json({
      accountType: subscription.accountType,
      status: subscription.status,
      features: featuresMap,
      limits: accountFeatures.limits,
      usage: subscription.limits, // Current usage data
      subscription: {
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        paymentMethod: subscription.paymentMethod,
      },
    })
  } catch (error) {
    console.error('Error fetching user features:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user features' },
      { status: 500 }
    )
  }
}
