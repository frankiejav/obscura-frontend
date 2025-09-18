/**
 * POST /api/webhooks/nowpayments
 * Handles NowPayments IPN callbacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyNowPaymentsSignature } from '@/lib/billing';
import { sql, updateSubscription, Plan, ensureUser } from '@/lib/db';
import { setAppMetadataPlan, isPersonalAccount } from '@/lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const signature = req.headers.get('x-nowpayments-sig');
    
    if (!signature) {
      return new NextResponse('No signature', { status: 400 });
    }
    
    // Verify IPN signature
    const isValidSignature = await verifyNowPaymentsSignature(payload, signature, process.env.NP_IPN_KEY!);
    if (!isValidSignature) {
      console.error('Invalid NowPayments signature');
      return new NextResponse('Invalid signature', { status: 401 });
    }
    
    console.log('NowPayments IPN received:', payload.payment_status);
    
    // Process payment based on status
    switch (payload.payment_status) {
      case 'finished':
      case 'confirmed':
        await handlePaymentSuccess(payload);
        break;
        
      case 'failed':
      case 'refunded':
      case 'expired':
        await handlePaymentFailed(payload);
        break;
        
      case 'waiting':
      case 'confirming':
      case 'sending':
        // Payment in progress, ignore for now
        console.log(`Payment ${payload.payment_id} in progress: ${payload.payment_status}`);
        break;
        
      default:
        console.log(`Unknown payment status: ${payload.payment_status}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('NowPayments webhook error:', error);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}

async function handlePaymentSuccess(payload: any) {
  const orderId = payload.order_id;
  const paymentId = payload.payment_id;
  const amount = payload.price_amount;
  
  // Parse order ID to get user and plan info
  // Format: "auth0_userId:plan:timestamp"
  const [userId, planName] = orderId.split(':');
  
  if (!userId || !planName) {
    console.error('Invalid order ID format:', orderId);
    return;
  }
  
  // Validate plan
  const plan = planName as Plan;
  if (!['pro', 'enterprise'].includes(plan)) {
    console.error('Invalid plan in order:', plan);
    return;
  }
  
  // Check for personal account override
  const effectivePlan = isPersonalAccount(userId) ? 'enterprise' : plan;
  
  // Calculate subscription end date (30 days from now for crypto payments)
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
  
  // Ensure user exists (might need email from somewhere)
  // For now, we'll need to store email in order_description or fetch from Auth0
  try {
    // Try to get user from Auth0 if needed
    const { getUserFromAuth0 } = await import('@/lib/auth');
    const auth0User = await getUserFromAuth0(userId);
    if (auth0User && auth0User.email) {
      await ensureUser(userId, auth0User.email);
    }
  } catch (error) {
    console.error('Could not ensure user exists:', error);
  }
  
  // Store NowPayments customer ID if not exists
  await sql`
    INSERT INTO billing_customers (auth0_user_id, np_customer_id)
    VALUES (${userId}, ${paymentId})
    ON CONFLICT (auth0_user_id) DO UPDATE
    SET np_customer_id = EXCLUDED.np_customer_id
  `;
  
  // Update subscription
  await updateSubscription(userId, effectivePlan, 'active', currentPeriodEnd);
  
  // Update Auth0 metadata
  try {
    await setAppMetadataPlan(userId, effectivePlan);
  } catch (error) {
    console.error('Failed to update Auth0 metadata:', error);
  }
  
  console.log(`NowPayments: Activated ${effectivePlan} subscription for user ${userId}`);
}

async function handlePaymentFailed(payload: any) {
  const orderId = payload.order_id;
  const [userId] = orderId.split(':');
  
  if (!userId) {
    console.error('Invalid order ID format:', orderId);
    return;
  }
  
  // Log the failure
  console.log(`NowPayments: Payment failed for user ${userId}, status: ${payload.payment_status}`);
  
  // Optional: Update subscription status if it was pending
  const { rows } = await sql`
    SELECT * FROM subscriptions 
    WHERE auth0_user_id = ${userId} AND status = 'pending'
  `;
  
  if (rows.length > 0) {
    await updateSubscription(userId, 'free', 'failed', undefined);
    console.log(`Reverted user ${userId} to free plan due to payment failure`);
  }
}

// Optional: GET endpoint to verify webhook is accessible
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    webhook: 'nowpayments',
    configured: !!process.env.NP_API_KEY
  });
}
