import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1'

export async function GET(request: NextRequest) {
  try {
    const paymentId = request.nextUrl.searchParams.get('payment_id')
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    const response = await axios.get(
      `${NOWPAYMENTS_API_URL}/payment/${paymentId}`,
      {
        headers: {
          'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
        },
      }
    )

    return NextResponse.json({
      paymentId: response.data.payment_id,
      paymentStatus: response.data.payment_status,
      payAddress: response.data.pay_address,
      priceAmount: response.data.price_amount,
      priceCurrency: response.data.price_currency,
      payAmount: response.data.pay_amount,
      actuallyPaid: response.data.actually_paid,
      payCurrency: response.data.pay_currency,
      orderDescription: response.data.order_description,
      purchaseId: response.data.purchase_id,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
      outcomeAmount: response.data.outcome_amount,
      outcomeCurrency: response.data.outcome_currency,
    })
  } catch (error: any) {
    console.error('NOWPayments status check error:', error)
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to retrieve payment status' },
      { status: 500 }
    )
  }
}
