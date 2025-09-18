/**
 * Billing Integration
 * Handles Stripe and NowPayments billing operations
 */

import Stripe from 'stripe';

// Lazy initialize Stripe to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_API_KEY) {
      throw new Error('STRIPE_API_KEY is not configured');
    }
    stripeInstance = new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Export stripe getter for use in other files
export { getStripe as stripe };

// Pricing configuration
export const PRICING = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO!,
    display: '$99/month',
    features: [
      'Full credential access',
      'Basic monitoring',
      'API access',
      '10,000 searches/month',
      'Email support'
    ]
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE!,
    display: '$299/month',
    features: [
      'Everything in Pro',
      'Advanced monitoring',
      'Real-time feeds',
      'Custom analytics',
      'Unlimited searches',
      'Priority support'
    ]
  }
};

/**
 * Map Stripe price ID to plan
 */
export function mapPriceToPlan(priceId: string): 'free' | 'pro' | 'enterprise' {
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) {
    return 'enterprise';
  }
  if (priceId === process.env.STRIPE_PRICE_PRO) {
    return 'pro';
  }
  return 'free';
}

/**
 * Map plan to Stripe price ID
 */
export function mapPlanToPrice(plan: 'pro' | 'enterprise'): string {
  return plan === 'enterprise' 
    ? process.env.STRIPE_PRICE_ENTERPRISE! 
    : process.env.STRIPE_PRICE_PRO!;
}

/**
 * Create or retrieve a Stripe customer
 */
export async function ensureStripeCustomer(
  auth0UserId: string,
  email: string,
  existingCustomerId?: string
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await getStripe().customers.create({
    email,
    metadata: {
      auth0_user_id: auth0UserId
    }
  });

  return customer.id;
}

/**
 * Get current subscription for a customer
 */
export async function getStripeSubscription(customerId: string): Promise<Stripe.Subscription | null> {
  const subscriptions = await getStripe().subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1
  });

  return subscriptions.data[0] || null;
}

/**
 * Cancel a subscription
 */
export async function cancelStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
}

/**
 * Reactivate a subscription
 */
export async function reactivateStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: false
  });
}

/**
 * Verify NowPayments IPN signature
 * Note: This function needs to run in Node.js runtime, not Edge
 */
export async function verifyNowPaymentsSignature(
  payload: any,
  signature: string,
  ipnSecret: string
): Promise<boolean> {
  try {
    // For Edge runtime compatibility, we'll use Web Crypto API
    const encoder = new TextEncoder();
    const sortedKeys = Object.keys(payload).sort();
    const sortedPayload: any = {};
    
    for (const key of sortedKeys) {
      if (key !== 'hmac') {
        sortedPayload[key] = payload[key];
      }
    }
    
    const paramString = JSON.stringify(sortedPayload);
    const keyData = encoder.encode(ipnSecret);
    const messageData = encoder.encode(paramString);
    
    // Import the key for HMAC
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    // Generate the signature
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      messageData
    );
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const calculatedSignature = hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return calculatedSignature === signature;
  } catch (error) {
    console.error('Error verifying NowPayments signature:', error);
    return false;
  }
}

/**
 * Create NowPayments payment
 */
export async function createNowPaymentsPayment(
  orderId: string,
  amount: number,
  currency: string = 'USD'
): Promise<any> {
  const response = await fetch('https://api.nowpayments.io/v1/payment', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.NP_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: currency,
      order_id: orderId,
      order_description: 'Obscura Labs Subscription',
      ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create NowPayments payment');
  }

  return await response.json();
}
