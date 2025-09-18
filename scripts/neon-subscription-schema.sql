-- Neon Postgres Schema for Subscription & Entitlements System
-- Run this script in your Neon database console

-- Create plan enum type
CREATE TYPE plan AS ENUM ('free', 'pro', 'enterprise');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  auth0_user_id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Billing customers mapping
CREATE TABLE IF NOT EXISTS billing_customers (
  auth0_user_id TEXT PRIMARY KEY REFERENCES users(auth0_user_id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  np_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  auth0_user_id TEXT PRIMARY KEY REFERENCES users(auth0_user_id) ON DELETE CASCADE,
  plan plan NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Entitlements table
CREATE TABLE IF NOT EXISTS entitlements (
  auth0_user_id TEXT PRIMARY KEY REFERENCES users(auth0_user_id) ON DELETE CASCADE,
  perms TEXT[] NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to get permissions for a plan
CREATE OR REPLACE FUNCTION perms_for_plan(p plan) RETURNS TEXT[] IMMUTABLE AS $$
  SELECT CASE p
    WHEN 'free' THEN ARRAY['creds:read_redacted']
    WHEN 'pro' THEN ARRAY['creds:read_full','monitoring:basic','api:access']
    WHEN 'enterprise' THEN ARRAY['creds:read_full','monitoring:advanced','api:access','realtime:feeds','analytics:custom']
  END;
$$ LANGUAGE sql;

-- Function to upsert subscription and entitlements
CREATE OR REPLACE FUNCTION upsert_subscription(u_id TEXT, p plan, s TEXT, cpe TIMESTAMPTZ)
RETURNS VOID AS $$
BEGIN
  INSERT INTO subscriptions (auth0_user_id, plan, status, current_period_end)
  VALUES (u_id, p, s, cpe)
  ON CONFLICT (auth0_user_id) DO UPDATE
    SET plan = EXCLUDED.plan,
        status = EXCLUDED.status,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = now();

  INSERT INTO entitlements (auth0_user_id, perms, updated_at)
  VALUES (u_id, perms_for_plan(p), now())
  ON CONFLICT (auth0_user_id) DO UPDATE
    SET perms = EXCLUDED.perms,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_customers_stripe ON billing_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_customers_np ON billing_customers(np_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
