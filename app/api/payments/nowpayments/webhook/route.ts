import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { handlePaymentSuccess } from '@/lib/user-subscription'
import { AccountType } from '@/lib/account-types'

// Helper function to sort object keys recursively
function sortObject(obj: any): any {
  return Object.keys(obj).sort().reduce(
    (result: any, key: string) => {
      result[key] = (obj[key] && typeof obj[key] === 'object') 
        ? sortObject(obj[key]) 
        : obj[key]
      return result
    },
    {}
  )
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-nowpayments-sig')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Sort the request body for signature verification
    const sortedBody = sortObject(body)
    const bodyString = JSON.stringify(sortedBody)
    
    // Create HMAC signature
    const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET!)
    hmac.update(bodyString)
    const calculatedSignature = hmac.digest('hex')
    
    // Verify signature
    if (calculatedSignature !== signature) {
      console.error('Invalid NOWPayments webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Process the payment update
    const {
      payment_id,
      payment_status,
      pay_address,
      price_amount,
      price_currency,
      pay_amount,
      actually_paid,
      pay_currency,
      order_id,
      order_description,
      purchase_id,
      outcome_amount,
      outcome_currency,
    } = body

    console.log('NOWPayments webhook received:', {
      payment_id,
      payment_status,
      order_id,
    })

    // Handle different payment statuses
    switch (payment_status) {
      case 'finished':
        // Payment completed successfully
        console.log('Payment completed:', payment_id)
        
        // Determine account type from the price
        let accountType: AccountType = AccountType.FREE
        const amount = parseFloat(price_amount)
        
        // Map price to account type
        if (amount >= 19 && amount < 25) { // ~$19.99 monthly
          accountType = AccountType.STARTER
        } else if (amount >= 95 && amount < 105) { // ~$99.00 quarterly
          accountType = AccountType.PROFESSIONAL
        }
        
        // Update user subscription in Auth0
        // Extract user ID from order_id or purchase_id
        // You should store the user ID when creating the payment
        if (order_id) {
          const userId = order_id.split('-')[1] || purchase_id
          
          await handlePaymentSuccess(userId, accountType, {
            paymentMethod: 'crypto',
          })
        }
        break
      
      case 'partially_paid':
        // Payment partially received
        console.log('Partial payment received:', payment_id)
        break
      
      case 'failed':
        // Payment failed
        console.log('Payment failed:', payment_id)
        break
      
      case 'refunded':
        // Payment refunded
        console.log('Payment refunded:', payment_id)
        break
      
      default:
        console.log('Payment status update:', payment_status)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('NOWPayments webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
