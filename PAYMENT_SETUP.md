# Payment Integration Setup Guide

This application integrates both **Stripe** for fiat payments and **NOWPayments** for cryptocurrency payments.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Stripe API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_STRIPE_WEBHOOK_SECRET

# NOWPayments API Keys
NOWPAYMENTS_API_KEY=YOUR_NOWPAYMENTS_API_KEY
NOWPAYMENTS_IPN_SECRET=YOUR_NOWPAYMENTS_IPN_SECRET

# Payment Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Stripe Setup

### 1. Create a Stripe Account
1. Sign up at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Navigate to the **Developers** section

### 2. Get Your API Keys
1. Go to **Developers → API keys**
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### 3. Configure Webhook Endpoint
1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL: `https://yourdomain.com/api/payments/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

### 4. Enable Test Mode
- Use test API keys for development (keys starting with `pk_test_` and `sk_test_`)
- Use test cards for payment testing:
  - Success: `4242 4242 4242 4242`
  - Authentication required: `4000 0025 0000 3155`
  - Declined: `4000 0000 0000 9995`

## NOWPayments Setup

### 1. Create a NOWPayments Account
1. Sign up at [nowpayments.io](https://nowpayments.io)
2. Complete account verification

### 2. Configure Your Account
1. Go to **Settings → General**
2. Add your payout wallet address (where you want to receive payments)
3. Select accepted cryptocurrencies

### 3. Generate API Keys
1. Go to **Settings → API**
2. Click **Generate API Key**
3. Copy and save the API key
4. Go to **Settings → IPN**
5. Click **Generate IPN Secret Key**
6. **Important**: Save the IPN secret immediately - it's only shown once!

### 4. Configure IPN Callback
1. The IPN callback URL is automatically set when creating payments
2. Default callback URL: `https://yourdomain.com/api/payments/nowpayments/webhook`
3. Ensure your firewall allows NOWPayments IP addresses (contact partners@nowpayments.io for the list)

## Pricing Structure

- **Starter Plan**: $19.99/month
- **Professional Plan**: $99/quarter (billed every 3 months)
- **Enterprise Plan**: Custom pricing

## Testing Payments

### Testing Stripe Payments
1. Use test mode with test API keys
2. Use test card numbers provided by Stripe
3. Monitor webhook events in Stripe Dashboard → Developers → Webhooks

### Testing NOWPayments
1. Use sandbox mode if available
2. For production testing, use small amounts
3. Monitor payment status through the NOWPayments dashboard

## Payment Flow

### Fiat Payment Flow (Stripe)
1. User selects plan on pricing page
2. Redirected to checkout page
3. Selects "Card Payment"
4. Stripe embedded checkout loads
5. User completes payment
6. Redirected to success page
7. Webhook confirms payment server-side

### Crypto Payment Flow (NOWPayments)
1. User selects plan on pricing page
2. Redirected to checkout page
3. Selects "Cryptocurrency"
4. Chooses crypto currency
5. Payment address generated
6. User sends crypto to address
7. Status updates in real-time
8. Redirected to success page on completion

## Webhook Security

### Stripe Webhook Verification
- Webhooks are verified using the signing secret
- Located in: `/app/api/payments/stripe/webhook/route.ts`

### NOWPayments IPN Verification
- IPN callbacks are verified using HMAC SHA-512
- Located in: `/app/api/payments/nowpayments/webhook/route.ts`

## Production Checklist

- [ ] Replace test API keys with production keys
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production domain
- [ ] Configure production webhook endpoints
- [ ] Test payment flows end-to-end
- [ ] Set up monitoring for failed payments
- [ ] Implement proper error logging
- [ ] Configure email notifications
- [ ] Set up database to store subscription data
- [ ] Implement subscription management UI
- [ ] Add payment receipt generation

## API Endpoints

### Stripe Endpoints
- `POST /api/payments/stripe/create-checkout-session` - Create checkout session
- `GET /api/payments/stripe/session-status` - Get session status
- `POST /api/payments/stripe/webhook` - Webhook handler

### NOWPayments Endpoints
- `POST /api/payments/nowpayments/create-payment` - Create crypto payment
- `GET /api/payments/nowpayments/payment-status` - Check payment status
- `POST /api/payments/nowpayments/webhook` - IPN webhook handler

## Troubleshooting

### Stripe Issues
- **"No such price"**: Ensure you're using the correct price IDs
- **Webhook signature verification failed**: Check webhook secret is correct
- **Checkout not loading**: Verify publishable key is correct

### NOWPayments Issues
- **Invalid API key**: Regenerate and update API key
- **Minimum amount error**: Check minimum payment amounts for each currency
- **IPN not received**: Whitelist NOWPayments IPs in firewall

## Support

- Stripe Support: [stripe.com/support](https://stripe.com/support)
- NOWPayments Support: support@nowpayments.io
- Documentation:
  - [Stripe Docs](https://stripe.com/docs)
  - [NOWPayments API Docs](https://documenter.getpostman.com/view/7907941/2s93JusNJt)
