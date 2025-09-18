/**
 * Neon Database Client
 * Serverless Postgres connection for Vercel Edge runtime
 */

import { neon } from '@neondatabase/serverless';

// Export the SQL client
export const sql = neon(process.env.DATABASE_URL!);

// Type definitions for database entities
export type Plan = 'free' | 'pro' | 'enterprise';

export interface User {
  auth0_user_id: string;
  email: string;
  created_at: Date;
}

export interface BillingCustomer {
  auth0_user_id: string;
  stripe_customer_id?: string;
  np_customer_id?: string;
  created_at: Date;
}

export interface Subscription {
  auth0_user_id: string;
  plan: Plan;
  status: string;
  current_period_end?: Date;
  updated_at: Date;
}

export interface Entitlement {
  auth0_user_id: string;
  perms: string[];
  updated_at: Date;
}

// Helper functions for common database operations
export async function getSubscription(userId: string): Promise<Subscription | null> {
  const { rows } = await sql`
    SELECT * FROM subscriptions 
    WHERE auth0_user_id = ${userId}
  `;
  return rows[0] as Subscription || null;
}

export async function getEntitlements(userId: string): Promise<string[]> {
  const { rows } = await sql`
    SELECT perms FROM entitlements 
    WHERE auth0_user_id = ${userId}
  `;
  return rows[0]?.perms || [];
}

export async function getBillingCustomer(userId: string): Promise<BillingCustomer | null> {
  const { rows } = await sql`
    SELECT * FROM billing_customers 
    WHERE auth0_user_id = ${userId}
  `;
  return rows[0] as BillingCustomer || null;
}

export async function ensureUser(userId: string, email: string): Promise<void> {
  await sql`
    INSERT INTO users (auth0_user_id, email) 
    VALUES (${userId}, ${email}) 
    ON CONFLICT (auth0_user_id) DO NOTHING
  `;
}

export async function updateSubscription(
  userId: string, 
  plan: Plan, 
  status: string, 
  currentPeriodEnd?: Date
): Promise<void> {
  await sql`
    SELECT upsert_subscription(
      ${userId}, 
      ${plan}::plan, 
      ${status}, 
      ${currentPeriodEnd || null}
    )
  `;
}
