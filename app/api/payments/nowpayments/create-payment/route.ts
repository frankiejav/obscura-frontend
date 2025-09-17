import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, planName, userEmail } = await request.json()

    // First, get minimum payment amount for the selected currency
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

    // Check if amount is greater than minimum
    if (amount < minAmount) {
      return NextResponse.json(
        { error: `Minimum amount for ${currency} is ${minAmount}` },
        { status: 400 }
      )
    }

    // Get estimated price
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

    const estimatedAmount = estimateResponse.data.estimated_amount

    // Create payment
    const paymentResponse = await axios.post(
      `${NOWPAYMENTS_API_URL}/payment`,
      {
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: currency,
        order_id: `order-${Date.now()}`,
        order_description: `${planName} subscription`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/nowpayments/webhook`,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/crypto-success`,
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
    })
  } catch (error: any) {
    console.error('NOWPayments payment creation error:', error)
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to create crypto payment' },
      { status: 500 }
    )
  }
}
