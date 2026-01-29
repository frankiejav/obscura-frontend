/**
 * POST /api/webhooks/nowpayments
 * Handles NowPayments IPN callbacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyNowPaymentsSignature, normalizePlanName } from '@/lib/billing';
import { sql, updateSubscription, ensureUser } from '@/lib/db';
import { setAppMetadataPlan, isPersonalAccount } from '@/lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface OrderIdParts {
  userId: string;
  plan: string;
  cycle: string;
  durationDays: number;
  timestamp: string;
}

function parseOrderId(orderId: string): OrderIdParts | null {
  const parts = orderId.split(':');
  
  if (parts.length === 2) {
    return {
      userId: parts[0],
      plan: parts[1],
      cycle: 'monthly',
      durationDays: 30,
      timestamp: Date.now().toString(),
    };
  }
  
  if (parts.length >= 4) {
    return {
      userId: parts[0],
      plan: parts[1],
      cycle: parts[2],
      durationDays: parseInt(parts[3]) || 30,
      timestamp: parts[4] || Date.now().toString(),
    };
  }
  
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const signature = req.headers.get('x-nowpayments-sig');
    
    if (!signature) {
      return new NextResponse('No signature', { status: 400 });
    }
    
    const isValidSignature = await verifyNowPaymentsSignature(
      payload, 
      signature, 
      process.env.NP_IPN_KEY!
    );
    
    if (!isValidSignature) {
      console.error('Invalid NowPayments signature');
      return new NextResponse('Invalid signature', { status: 401 });
    }
    
    console.log('NowPayments IPN received:', payload.payment_status, 'Order:', payload.order_id);
    
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
        console.log(`Payment ${payload.payment_id} in progress: ${payload.payment_status}`);
        break;
        
      case 'partially_paid':
        console.log(`Payment ${payload.payment_id} partially paid`);
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
  
  const parsed = parseOrderId(orderId);
  
  if (!parsed) {
    console.error('Invalid order ID format:', orderId);
    return;
  }

  const { userId, plan, durationDays } = parsed;
  
  const normalizedPlan = normalizePlanName(plan);
  
  if (normalizedPlan === 'free') {
    console.error('Invalid plan in order:', plan);
    return;
  }
  
  const effectivePlan = isPersonalAccount(userId) ? 'enterprise' : normalizedPlan;
  
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + durationDays);
  
  try {
    const { getUserFromAuth0 } = await import('@/lib/auth');
    const auth0User = await getUserFromAuth0(userId);
    if (auth0User?.email) {
      await ensureUser(userId, auth0User.email);
    }
  } catch (error) {
    console.error('Could not ensure user exists:', error);
  }
  
  await sql`
    INSERT INTO billing_customers (auth0_user_id, np_customer_id)
    VALUES (${userId}, ${paymentId})
    ON CONFLICT (auth0_user_id) DO UPDATE
    SET np_customer_id = EXCLUDED.np_customer_id
  `;
  
  await sql`
    INSERT INTO crypto_payments (
      auth0_user_id, 
      payment_id, 
      order_id, 
      plan, 
      amount, 
      currency, 
      status, 
      period_end
    )
    VALUES (
      ${userId}, 
      ${paymentId}, 
      ${orderId}, 
      ${effectivePlan}, 
      ${payload.price_amount || 0}, 
      ${payload.pay_currency || 'unknown'}, 
      'completed',
      ${currentPeriodEnd}
    )
    ON CONFLICT (payment_id) DO UPDATE
    SET status = 'completed', period_end = EXCLUDED.period_end
  `;
  
  await updateSubscription(userId, effectivePlan as any, 'active', currentPeriodEnd);
  
  try {
    await setAppMetadataPlan(userId, effectivePlan as any);
  } catch (error) {
    console.error('Failed to update Auth0 metadata:', error);
  }
  
  console.log(`NowPayments: Activated ${effectivePlan} subscription for user ${userId} until ${currentPeriodEnd.toISOString()}`);
}

async function handlePaymentFailed(payload: any) {
  const orderId = payload.order_id;
  const parsed = parseOrderId(orderId);
  
  if (!parsed) {
    console.error('Invalid order ID format:', orderId);
    return;
  }
  
  const { userId } = parsed;
  
  console.log(`NowPayments: Payment failed for user ${userId}, status: ${payload.payment_status}`);
  
  await sql`
    INSERT INTO crypto_payments (
      auth0_user_id, 
      payment_id, 
      order_id, 
      plan, 
      status
    )
    VALUES (
      ${userId}, 
      ${payload.payment_id}, 
      ${orderId}, 
      'none', 
      ${payload.payment_status}
    )
    ON CONFLICT (payment_id) DO UPDATE
    SET status = EXCLUDED.status
  `;
  
  const { rows } = await sql`
    SELECT * FROM subscriptions 
    WHERE auth0_user_id = ${userId} AND status = 'pending'
  `;
  
  if (rows.length > 0) {
    await updateSubscription(userId, 'free', 'failed', undefined);
    console.log(`Reverted user ${userId} to free plan due to payment failure`);
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    webhook: 'nowpayments',
    configured: !!process.env.NOWPAYMENTS_API_KEY
  });
}
