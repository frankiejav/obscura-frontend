/**
 * POST /api/billing/portal
 * Creates a Stripe customer portal session
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/billing';
import { verifyAccessToken, extractBearerToken } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = extractBearerToken(authHeader);
    const payload = await verifyAccessToken(token);
    
    if (!payload.sub) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const body = await req.json();
    const returnUrl = body.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.obscuralabs.io'}/dashboard/settings`;
    
    // Get Stripe customer ID
    const { rows } = await sql`
      SELECT stripe_customer_id FROM billing_customers 
      WHERE auth0_user_id = ${payload.sub}
    `;
    
    const customerId = rows[0]?.stripe_customer_id;
    
    if (!customerId) {
      return NextResponse.json(
        { 
          error: 'No billing account found',
          message: 'You need to purchase a subscription first'
        },
        { status: 400 }
      );
    }
    
    // Create portal session
    const portalSession = await stripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    return NextResponse.json({ 
      url: portalSession.url 
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
