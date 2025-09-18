/**
 * POST /api/billing/checkout
 * Creates a Stripe checkout session for subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, ensureStripeCustomer } from '@/lib/billing';
import { verifyAccessToken, extractBearerToken } from '@/lib/auth';
import { sql, ensureUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = extractBearerToken(authHeader);
    const payload = await verifyAccessToken(token);
    
    if (!payload.sub || !payload.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { priceId, successUrl, cancelUrl } = await req.json();
    
    if (!priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, successUrl, cancelUrl' },
        { status: 400 }
      );
    }
    
    // Ensure user exists in database
    await ensureUser(payload.sub, payload.email);
    
    // Get or create Stripe customer
    const { rows } = await sql`
      SELECT stripe_customer_id FROM billing_customers 
      WHERE auth0_user_id = ${payload.sub}
    `;
    
    let customerId = rows[0]?.stripe_customer_id;
    
    if (!customerId) {
      customerId = await ensureStripeCustomer(payload.sub, payload.email);
      
      // Save customer mapping
      await sql`
        INSERT INTO billing_customers (auth0_user_id, stripe_customer_id)
        VALUES (${payload.sub}, ${customerId})
        ON CONFLICT (auth0_user_id) DO UPDATE
        SET stripe_customer_id = EXCLUDED.stripe_customer_id
      `;
    }
    
    // Check for existing active subscription
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });
    
    if (existingSubscriptions.data.length > 0) {
      // User already has an active subscription, redirect to billing portal
      return NextResponse.json(
        { 
          error: 'Active subscription exists',
          message: 'Please use the billing portal to manage your subscription',
          hasActiveSubscription: true
        },
        { status: 400 }
      );
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto'
      },
      metadata: {
        auth0_user_id: payload.sub
      }
    });
    
    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
