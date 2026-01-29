/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, mapPriceToPlan, normalizePlanName } from '@/lib/billing';
import { sql, updateSubscription } from '@/lib/db';
import { setAppMetadataPlan, isPersonalAccount } from '@/lib/auth';

type Plan = 'free' | 'starter' | 'professional' | 'enterprise';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  
  if (!sig) {
    return new NextResponse('No signature', { status: 400 });
  }
  
  try {
    const body = await req.text();
    let event: any;
    
    try {
      event = stripe().webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }
    
    console.log(`Processing Stripe webhook: ${event.type}`);
    
    // Handle relevant events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutComplete(session);
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionChange(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handleInvoicePaymentFailed(invoice);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}

async function handleCheckoutComplete(session: any) {
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  
  if (!customerId || !subscriptionId) {
    console.log('Missing customer or subscription in checkout session');
    return;
  }
  
  // Get the subscription details
  const subscription = await stripe().subscriptions.retrieve(subscriptionId);
  await handleSubscriptionChange(subscription);
}

async function handleSubscriptionChange(subscription: any) {
  const customerId = subscription.customer;
  const status = subscription.status;
  const priceId = subscription.items?.data?.[0]?.price?.id;
  const currentPeriodEnd = subscription.current_period_end 
    ? new Date(subscription.current_period_end * 1000) 
    : undefined;
  
  if (!priceId) {
    console.log('No price ID in subscription');
    return;
  }
  
  const result = await sql`
    SELECT auth0_user_id FROM billing_customers 
    WHERE stripe_customer_id = ${customerId}
  `;
  
  const rows = Array.isArray(result) ? result : [];
  
  if (rows.length === 0) {
    console.error(`No user found for Stripe customer: ${customerId}`);
    return;
  }
  
  const userId = rows[0].auth0_user_id as string;
  
  let plan: Plan = mapPriceToPlan(priceId);
  
  if (isPersonalAccount(userId)) {
    plan = 'enterprise';
  }
  
  await updateSubscription(userId, plan as any, status, currentPeriodEnd);
  
  try {
    await setAppMetadataPlan(userId, plan as any);
  } catch (error) {
    console.error('Failed to update Auth0 metadata:', error);
  }
  
  console.log(`Updated subscription for user ${userId}: ${plan} (${status})`);
}

async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer;
  
  const result = await sql`
    SELECT auth0_user_id FROM billing_customers 
    WHERE stripe_customer_id = ${customerId}
  `;
  
  const rows = Array.isArray(result) ? result : [];
  
  if (rows.length === 0) {
    console.error(`No user found for Stripe customer: ${customerId}`);
    return;
  }
  
  const userId = rows[0].auth0_user_id as string;
  
  const plan: Plan = isPersonalAccount(userId) ? 'enterprise' : 'free';
  
  await updateSubscription(userId, plan as any, 'cancelled', undefined);
  
  try {
    await setAppMetadataPlan(userId, plan as any);
  } catch (error) {
    console.error('Failed to update Auth0 metadata:', error);
  }
  
  console.log(`Cancelled subscription for user ${userId}, reverted to ${plan}`);
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;
  
  if (!subscriptionId) return;
  
  // Update subscription status if needed
  const subscription = await stripe().subscriptions.retrieve(subscriptionId);
  if (subscription.status === 'active') {
    await handleSubscriptionChange(subscription);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  const customerId = invoice.customer;
  
  const result = await sql`
    SELECT auth0_user_id FROM billing_customers 
    WHERE stripe_customer_id = ${customerId}
  `;
  
  const rows = Array.isArray(result) ? result : [];
  
  if (rows.length === 0) return;
  
  const userId = rows[0].auth0_user_id as string;
  
  await sql`
    UPDATE subscriptions 
    SET status = 'past_due', updated_at = now()
    WHERE auth0_user_id = ${userId}
  `;
  
  console.log(`Payment failed for user ${userId}, marked as past_due`);
}
