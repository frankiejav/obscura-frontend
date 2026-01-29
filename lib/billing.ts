/**
 * Billing Integration
 * Handles Stripe and NowPayments billing operations
 */

import Stripe from 'stripe';

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

export { getStripe as stripe };

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';
export type PlanTier = 'starter' | 'professional' | 'enterprise';

export interface PricingTier {
  name: string;
  description: string;
  prices: {
    monthly?: { amount: number; priceId: string };
    quarterly?: { amount: number; priceId: string; savings: string };
    yearly?: { amount: number; priceId: string; savings: string };
  };
  features: string[];
  limits: {
    lookupsPerDay?: number;
    lookupsPerMonth?: number;
    apiCreditsPerMonth?: number;
    monitoringTargets?: number;
  };
  popular?: boolean;
}

export const PRICING_CONFIG: Record<PlanTier, PricingTier> = {
  starter: {
    name: 'Starter',
    description: 'For individuals and researchers',
    prices: {
      monthly: { 
        amount: 19.99, 
        priceId: process.env.STRIPE_PRICE_STARTER_MONTHLY! 
      },
      yearly: { 
        amount: 191.88, 
        priceId: process.env.STRIPE_PRICE_STARTER_YEARLY!,
        savings: 'Save 20%'
      },
    },
    features: [
      '200 lookups per day',
      'Dashboard access',
      'CSV/JSON exports',
      '30-day data retention',
      'Email support',
    ],
    limits: {
      lookupsPerDay: 200,
    },
  },
  professional: {
    name: 'Professional',
    description: 'For security teams',
    prices: {
      monthly: { 
        amount: 49, 
        priceId: process.env.STRIPE_PRICE_PRO_MONTHLY! 
      },
      quarterly: { 
        amount: 99, 
        priceId: process.env.STRIPE_PRICE_PRO_QUARTERLY!,
        savings: 'Best value'
      },
      yearly: { 
        amount: 349, 
        priceId: process.env.STRIPE_PRICE_PRO_YEARLY!,
        savings: 'Save 25%'
      },
    },
    features: [
      'Unlimited lookups',
      '10,000 API credits/month',
      'Credential monitoring (100 targets)',
      'Full API access',
      'Team collaboration (5 members)',
      'Priority support',
    ],
    limits: {
      lookupsPerMonth: -1,
      apiCreditsPerMonth: 10000,
      monitoringTargets: 100,
    },
    popular: true,
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large organizations',
    prices: {
      monthly: { 
        amount: 299, 
        priceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY! 
      },
      yearly: { 
        amount: 2868, 
        priceId: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY!,
        savings: 'Save 20%'
      },
    },
    features: [
      'Everything in Professional',
      'Unlimited API credits',
      'Real-time data feeds',
      'Custom analytics',
      'Unlimited monitoring targets',
      'Unlimited team members',
      '24/7 dedicated support',
      'SLA guarantees',
    ],
    limits: {
      lookupsPerMonth: -1,
      apiCreditsPerMonth: -1,
      monitoringTargets: -1,
    },
  },
};

export const LEGACY_PRICING = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_PRO_QUARTERLY!,
    display: '$99/quarter',
    features: [
      'Full credential access',
      'Basic monitoring',
      'API access',
      '10,000 searches/month',
      'Email support'
    ]
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE || process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
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
 * Map Stripe price ID to plan tier
 */
export function mapPriceToPlan(priceId: string): 'free' | 'starter' | 'professional' | 'enterprise' {
  const starterPrices = [
    process.env.STRIPE_PRICE_STARTER_MONTHLY,
    process.env.STRIPE_PRICE_STARTER_YEARLY,
  ];
  
  const proPrices = [
    process.env.STRIPE_PRICE_PRO,
    process.env.STRIPE_PRICE_PRO_MONTHLY,
    process.env.STRIPE_PRICE_PRO_QUARTERLY,
    process.env.STRIPE_PRICE_PRO_YEARLY,
  ];
  
  const enterprisePrices = [
    process.env.STRIPE_PRICE_ENTERPRISE,
    process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
  ];
  
  if (enterprisePrices.includes(priceId)) {
    return 'enterprise';
  }
  if (proPrices.includes(priceId)) {
    return 'professional';
  }
  if (starterPrices.includes(priceId)) {
    return 'starter';
  }
  return 'free';
}

/**
 * Get price ID for a plan and billing cycle
 */
export function getPriceId(plan: PlanTier, cycle: BillingCycle): string | null {
  const tier = PRICING_CONFIG[plan];
  if (!tier) return null;
  
  const price = tier.prices[cycle];
  return price?.priceId || null;
}

/**
 * Get price amount for a plan and billing cycle
 */
export function getPriceAmount(plan: PlanTier, cycle: BillingCycle): number {
  const tier = PRICING_CONFIG[plan];
  if (!tier) return 0;
  
  const price = tier.prices[cycle];
  return price?.amount || 0;
}

/**
 * Map old plan names to new ones for backwards compatibility
 */
export function normalizePlanName(plan: string): 'free' | 'starter' | 'professional' | 'enterprise' {
  const normalized = plan.toLowerCase();
  if (normalized === 'pro') return 'professional';
  if (['free', 'starter', 'professional', 'enterprise'].includes(normalized)) {
    return normalized as 'free' | 'starter' | 'professional' | 'enterprise';
  }
  return 'free';
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
