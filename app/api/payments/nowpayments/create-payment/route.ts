import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { auth0 } from '@/lib/auth0'
import { getPriceAmount, type PlanTier, type BillingCycle } from '@/lib/billing'

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1'

const PLAN_MAP: Record<string, { tier: PlanTier; cycle: BillingCycle }> = {
  'Starter Monthly': { tier: 'starter', cycle: 'monthly' },
  'Starter Yearly': { tier: 'starter', cycle: 'yearly' },
  'Professional': { tier: 'professional', cycle: 'quarterly' },
  'Professional Monthly': { tier: 'professional', cycle: 'monthly' },
  'Professional Quarterly': { tier: 'professional', cycle: 'quarterly' },
  'Professional Yearly': { tier: 'professional', cycle: 'yearly' },
  'Enterprise': { tier: 'enterprise', cycle: 'monthly' },
  'Enterprise Monthly': { tier: 'enterprise', cycle: 'monthly' },
  'Enterprise Yearly': { tier: 'enterprise', cycle: 'yearly' },
}

function calculateDurationDays(cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly': return 30;
    case 'quarterly': return 90;
    case 'yearly': return 365;
    default: return 30;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.sub
    const userEmail = session.user.email

    const { amount, currency, planName, billingCycle = 'monthly' } = await request.json()

    const planInfo = PLAN_MAP[planName] || { tier: 'professional' as PlanTier, cycle: billingCycle as BillingCycle }
    const expectedAmount = getPriceAmount(planInfo.tier, planInfo.cycle)
    
    if (expectedAmount > 0 && Math.abs(amount - expectedAmount) > 1) {
      console.warn(`Price mismatch: expected ${expectedAmount}, got ${amount}`)
    }

    const minAmountResponse = await axios.get(
      `${NOWPAYMENTS_API_URL}/min-amount`,
      {
        headers: {
          'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
        },
        params: {
          currency_from: currency,
          currency_to: 'usd',
        },
      }
    )

    const minAmount = minAmountResponse.data.min_amount

    if (amount < minAmount) {
      return NextResponse.json(
        { error: `Minimum amount for ${currency} is ${minAmount}` },
        { status: 400 }
      )
    }

    const estimateResponse = await axios.get(
      `${NOWPAYMENTS_API_URL}/estimate`,
      {
        headers: {
          'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
        },
        params: {
          amount: amount,
          currency_from: 'usd',
          currency_to: currency,
        },
      }
    )

    const durationDays = calculateDurationDays(planInfo.cycle)
    const orderId = `${userId}:${planInfo.tier}:${planInfo.cycle}:${durationDays}:${Date.now()}`

    const paymentResponse = await axios.post(
      `${NOWPAYMENTS_API_URL}/payment`,
      {
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: currency,
        order_id: orderId,
        order_description: `Obscura Labs ${planInfo.tier} subscription (${planInfo.cycle})`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/nowpayments`,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/crypto-success?plan=${planInfo.tier}&cycle=${planInfo.cycle}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
        customer_email: userEmail,
      },
      {
        headers: {
          'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
          'Content-Type': 'application/json',
        },
      }
    )

    return NextResponse.json({
      paymentId: paymentResponse.data.payment_id,
      payAddress: paymentResponse.data.pay_address,
      payAmount: paymentResponse.data.pay_amount,
      payCurrency: paymentResponse.data.pay_currency,
      paymentStatus: paymentResponse.data.payment_status,
      purchaseId: paymentResponse.data.purchase_id,
      validUntil: paymentResponse.data.valid_until,
      payinExtraId: paymentResponse.data.payin_extra_id,
      orderId: orderId,
    })
  } catch (error: any) {
    console.error('NOWPayments payment creation error:', error)
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to create crypto payment' },
      { status: 500 }
    )
  }
}
