import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { auth0 } from '@/lib/auth0'
import { getPriceId, type PlanTier, type BillingCycle } from '@/lib/billing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const PLAN_NAME_MAP: Record<string, PlanTier> = {
  'Starter': 'starter',
  'Professional': 'professional',
  'Enterprise': 'enterprise',
}

const BILLING_INTERVAL_MAP: Record<BillingCycle, Stripe.Price.Recurring.Interval> = {
  'monthly': 'month',
  'quarterly': 'month',
  'yearly': 'year',
}

const BILLING_INTERVAL_COUNT_MAP: Record<BillingCycle, number> = {
  'monthly': 1,
  'quarterly': 3,
  'yearly': 1,
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession(request)
    const userId = session?.user?.sub
    const userEmail = session?.user?.email

    const { planName, planPrice, billingCycle = 'monthly' } = await request.json()

    const planTier = PLAN_NAME_MAP[planName] || 'professional'
    const cycle = billingCycle as BillingCycle
    
    const configuredPriceId = getPriceId(planTier, cycle)
    
    const interval = BILLING_INTERVAL_MAP[cycle]
    const intervalCount = BILLING_INTERVAL_COUNT_MAP[cycle]
    
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]
    
    if (configuredPriceId) {
      lineItems = [{
        price: configuredPriceId,
        quantity: 1,
      }]
    } else {
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Obscura Labs ${planName}`,
            description: `${planName} subscription (${cycle})`,
          },
          recurring: {
            interval,
            interval_count: intervalCount,
          },
          unit_amount: Math.round(planPrice * 100),
        },
        quantity: 1,
      }]
    }
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: lineItems,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/return?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      metadata: {
        plan_tier: planTier,
        billing_cycle: cycle,
        ...(userId && { auth0_user_id: userId }),
      },
    }

    if (userEmail) {
      sessionParams.customer_email = userEmail
    } else {
      sessionParams.customer_creation = 'always'
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ 
      clientSecret: checkoutSession.client_secret 
    })
  } catch (error) {
    console.error('Stripe session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
