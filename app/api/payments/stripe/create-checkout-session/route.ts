import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { priceId, planName, planPrice } = await request.json()

    // Determine billing interval based on plan
    const billingInterval = planName === 'Professional' ? 'quarter' : 'month'
    
    // Create Checkout Session with embedded mode
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      mode: 'subscription', // or 'payment' for one-time payments
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName,
              description: `${planName} subscription plan`,
            },
            recurring: {
              interval: billingInterval as 'month' | 'quarter',
            },
            unit_amount: Math.round(planPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/return?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: { enabled: true },
      customer_creation: 'always',
      billing_address_collection: 'required',
    })

    return NextResponse.json({ 
      clientSecret: session.client_secret 
    })
  } catch (error) {
    console.error('Stripe session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
