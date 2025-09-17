import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { handlePaymentSuccess } from '@/lib/user-subscription'
import { AccountType } from '@/lib/account-types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)
        
        // Determine account type from the price
        let accountType: AccountType = AccountType.FREE
        const amount = session.amount_total || 0
        
        // Map price to account type (prices in cents)
        if (amount === 1999) { // $19.99 monthly
          accountType = AccountType.STARTER
        } else if (amount === 9900) { // $99.00 quarterly
          accountType = AccountType.PROFESSIONAL
        }
        
        // Update user subscription in Auth0
        if (session.customer_details?.email) {
          // Get user ID from customer email (you might want to store this differently)
          // For now, we'll use the customer ID from Stripe
          const userId = session.client_reference_id || session.customer as string
          
          await handlePaymentSuccess(userId, accountType, {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            paymentMethod: 'stripe',
          })
        }
        break

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription created:', subscription.id)
        // TODO: Update user's subscription status
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', updatedSubscription.id)
        // TODO: Handle subscription changes
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        console.log('Subscription cancelled:', deletedSubscription.id)
        // TODO: Handle subscription cancellation
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded for invoice:', invoice.id)
        // TODO: Send receipt email to customer
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', failedInvoice.id)
        // TODO: Send notification to customer about failed payment
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
