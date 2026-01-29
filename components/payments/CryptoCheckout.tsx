"use client"

import { useState, useEffect, useCallback } from "react"
import { Copy, CheckCircle, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import QRCode from 'qrcode'

type BillingCycle = 'monthly' | 'quarterly' | 'yearly'

interface CryptoCheckoutProps {
  planName: string
  planPrice: number
  userEmail?: string
  billingCycle?: BillingCycle
}

const SUPPORTED_CURRENCIES = [
  { value: 'btc', label: 'Bitcoin (BTC)', icon: '₿' },
  { value: 'eth', label: 'Ethereum (ETH)', icon: 'Ξ' },
  { value: 'usdt', label: 'Tether (USDT)', icon: '₮' },
  { value: 'ltc', label: 'Litecoin (LTC)', icon: 'Ł' },
  { value: 'bnb', label: 'Binance Coin (BNB)', icon: 'BNB' },
  { value: 'trx', label: 'TRON (TRX)', icon: 'TRX' },
  { value: 'doge', label: 'Dogecoin (DOGE)', icon: 'Ð' },
]

export default function CryptoCheckout({ 
  planName, 
  planPrice,
  userEmail = '',
  billingCycle = 'monthly'
}: CryptoCheckoutProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('btc')
  const [email, setEmail] = useState(userEmail)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)

  const createPayment = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/payments/nowpayments/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: planPrice,
          currency: selectedCurrency,
          planName,
          userEmail: email,
          billingCycle,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment')
      }

      const data = await response.json()
      setPaymentData(data)

      // Generate QR code
      if (data.payAddress) {
        const qrDataUrl = await QRCode.toDataURL(
          `${selectedCurrency}:${data.payAddress}?amount=${data.payAmount}`
        )
        setQrCode(qrDataUrl)
      }

      // Start checking payment status
      startStatusCheck(data.paymentId)
    } catch (err: any) {
      console.error('Error creating payment:', err)
      setError(err.message || 'Failed to create payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startStatusCheck = (paymentId: string) => {
    // Clear any existing interval
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval)
    }

    // Check status every 10 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/payments/nowpayments/payment-status?payment_id=${paymentId}`
        )
        
        if (response.ok) {
          const data = await response.json()
          setPaymentStatus(data.paymentStatus)

          // If payment is finished or failed, stop checking
          if (['finished', 'failed', 'refunded'].includes(data.paymentStatus)) {
            clearInterval(interval)
            setStatusCheckInterval(null)

            if (data.paymentStatus === 'finished') {
              // Redirect to success page
              window.location.href = '/payments/crypto-success'
            }
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }, 10000)

    setStatusCheckInterval(interval)
  }

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }
    }
  }, [statusCheckInterval])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'finished': return 'text-green-400'
      case 'partially_paid': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      case 'refunded': return 'text-orange-400'
      default: return 'text-neutral-400'
    }
  }

  if (paymentData) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Complete Your Crypto Payment</CardTitle>
            <CardDescription className="text-neutral-400">
              Send exactly {paymentData.payAmount} {paymentData.payCurrency.toUpperCase()} to the address below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code */}
            {qrCode && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <img src={qrCode} alt="Payment QR Code" className="w-48 h-48" />
                </div>
              </div>
            )}

            {/* Payment Address */}
            <div className="space-y-2">
              <Label className="text-white">Payment Address</Label>
              <div className="flex gap-2">
                <Input
                  value={paymentData.payAddress}
                  readOnly
                  className="bg-neutral-800 border-white/20 text-white font-mono text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(paymentData.payAddress)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-white">Amount to Send</Label>
              <div className="flex gap-2">
                <Input
                  value={`${paymentData.payAmount} ${paymentData.payCurrency.toUpperCase()}`}
                  readOnly
                  className="bg-neutral-800 border-white/20 text-white font-mono"
                />
                <Button
                  onClick={() => copyToClipboard(paymentData.payAmount.toString())}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Extra ID if required */}
            {paymentData.payinExtraId && (
              <div className="space-y-2">
                <Label className="text-white">Memo/Tag (Required!)</Label>
                <div className="flex gap-2">
                  <Input
                    value={paymentData.payinExtraId}
                    readOnly
                    className="bg-neutral-800 border-white/20 text-white font-mono"
                  />
                  <Button
                    onClick={() => copyToClipboard(paymentData.payinExtraId)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-yellow-400">
                  ⚠️ Important: Include this memo/tag or your payment will be lost!
                </p>
              </div>
            )}

            {/* Payment Status */}
            <div className="space-y-2">
              <Label className="text-white">Payment Status</Label>
              <div className={`flex items-center gap-2 ${getStatusColor(paymentStatus)}`}>
                {paymentStatus === 'waiting' && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Waiting for payment...</span>
                  </>
                )}
                {paymentStatus === 'confirming' && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Confirming transaction...</span>
                  </>
                )}
                {paymentStatus === 'finished' && (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Payment completed successfully!</span>
                  </>
                )}
                {paymentStatus === 'partially_paid' && (
                  <span>Partial payment received</span>
                )}
                {paymentStatus === 'failed' && (
                  <span>Payment failed</span>
                )}
              </div>
            </div>

            <Alert className="bg-neutral-800/50 border-white/10">
              <AlertDescription className="text-neutral-300 text-sm">
                Payment ID: {paymentData.paymentId}<br />
                This payment will expire in 20 minutes. Status updates automatically.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Crypto Payment Details</CardTitle>
          <CardDescription className="text-neutral-400">
            Complete the form below to generate your payment address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="bg-red-900/20 border-red-500/30">
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-neutral-800 border-white/20 text-white placeholder:text-neutral-500"
            />
            <p className="text-xs text-neutral-400">
              We'll send your receipt to this address
            </p>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-white">
              Select Cryptocurrency
            </Label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="bg-neutral-800 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/20">
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <SelectItem 
                    key={currency.value} 
                    value={currency.value}
                    className="text-white hover:bg-white/10"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono">{currency.icon}</span>
                      <span>{currency.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Display */}
          <div className="p-4 bg-neutral-800/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Amount to pay:</span>
              <span className="text-xl font-bold text-white">
                ${planPrice} USD
              </span>
            </div>
            <div className="text-xs text-neutral-500 mt-2">
              Exact crypto amount will be calculated at current exchange rate
            </div>
          </div>

          {/* Generate Payment Button */}
          <Button
            onClick={createPayment}
            disabled={loading || !email}
            className="w-full bg-white text-black hover:bg-neutral-200 transition-all duration-300"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Payment...
              </>
            ) : (
              <>
                Generate Payment Address
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-neutral-500">
            Secure payment processed by NOWPayments
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
