"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CreditCard, CheckCircle, XCircle, AlertCircle, Zap, Bitcoin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const PLANS = {
  free: {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Basic search (redacted)',
      '100 searches/month',
      'Community support',
    ]
  },
  pro: {
    name: 'Professional',
    price: '$99',
    period: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    features: [
      'Full credential access',
      'Basic monitoring',
      'API access',
      '10,000 searches/month',
      'Email support',
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: '$299',
    period: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE,
    features: [
      'Everything in Pro',
      'Advanced monitoring',
      'Real-time feeds',
      'Custom analytics',
      'Unlimited searches',
      'Priority support',
    ]
  }
}

export default function SubscriptionManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [subscription, setSubscription] = useState<any>(null)
  const [entitlements, setEntitlements] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchEntitlements()
  }, [])

  const fetchEntitlements = async () => {
    try {
      const token = localStorage.getItem('auth_token') // Or get from your auth context
      const res = await fetch('/api/entitlements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        throw new Error('Failed to fetch entitlements')
      }
      
      const data = await res.json()
      setEntitlements(data)
      setCurrentPlan(data.plan)
      setSubscription(data.subscription)
    } catch (err: any) {
      console.error('Error fetching entitlements:', err)
      setError('Failed to load subscription information')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    setProcessing(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('auth_token')
      
      if (paymentMethod === 'stripe') {
        // Stripe checkout
        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            priceId: PLANS[selectedPlan].priceId,
            successUrl: `${window.location.origin}/dashboard/settings?success=true`,
            cancelUrl: `${window.location.origin}/dashboard/settings?cancelled=true`
          })
        })
        
        if (!res.ok) {
          const data = await res.json()
          if (data.hasActiveSubscription) {
            setError('You already have an active subscription. Use the billing portal to manage it.')
            return
          }
          throw new Error(data.error || 'Failed to create checkout session')
        }
        
        const { url } = await res.json()
        window.location.href = url
      } else {
        // Crypto payment (NowPayments)
        setError('Crypto payments coming soon!')
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to initiate checkout')
    } finally {
      setProcessing(false)
    }
  }

  const handlePortal = async () => {
    setProcessing(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/settings`
        })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to open billing portal')
      }
      
      const { url } = await res.json()
      window.location.href = url
    } catch (err: any) {
      console.error('Portal error:', err)
      setError(err.message || 'Failed to open billing portal')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  const isFreePlan = currentPlan === 'free'
  const canUpgrade = currentPlan !== 'enterprise'

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Current Plan
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Manage your subscription and billing
              </CardDescription>
            </div>
            <Badge 
              variant={currentPlan === 'enterprise' ? 'default' : 'secondary'}
              className="text-lg px-4 py-1"
            >
              {PLANS[currentPlan as keyof typeof PLANS].name}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {subscription && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <p className="text-sm text-neutral-400 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  {subscription.isActive ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-white font-semibold">Active</span>
                    </>
                  ) : subscription.isPastDue ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-white font-semibold">Past Due</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-white font-semibold">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              
              {subscription.currentPeriodEnd && (
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <p className="text-sm text-neutral-400 mb-1">Next Billing Date</p>
                  <p className="text-white font-semibold">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {entitlements?.limits && (
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <p className="text-sm text-neutral-400 mb-1">Monthly Searches</p>
                  <p className="text-white font-semibold">
                    {entitlements.limits.searches_per_month === -1 
                      ? 'Unlimited' 
                      : entitlements.limits.searches_per_month.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {!isFreePlan && (
            <div className="pt-4 border-t border-white/10">
              <Button
                onClick={handlePortal}
                disabled={processing}
                className="bg-white text-black hover:bg-neutral-200"
              >
                {processing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Manage Billing
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {canUpgrade && (
        <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              Upgrade Your Plan
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Unlock more features and higher limits
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="plans" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-neutral-800/50">
                <TabsTrigger value="plans">Choose Plan</TabsTrigger>
                <TabsTrigger value="payment">Payment Method</TabsTrigger>
              </TabsList>
              
              <TabsContent value="plans" className="space-y-4 mt-6">
                <RadioGroup value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as 'pro' | 'enterprise')}>
                  {currentPlan === 'free' && (
                    <div className="border border-white/20 rounded-lg p-4 hover:bg-neutral-800/30 transition-colors">
                      <Label htmlFor="pro" className="flex items-start gap-4 cursor-pointer">
                        <RadioGroupItem value="pro" id="pro" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-semibold text-white">Professional</span>
                            <span className="text-2xl font-bold text-white">$99<span className="text-sm text-neutral-400">/mo</span></span>
                          </div>
                          <ul className="space-y-1">
                            {PLANS.pro.features.map((feature, i) => (
                              <li key={i} className="text-sm text-neutral-300 flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Label>
                    </div>
                  )}
                  
                  <div className="border border-white/20 rounded-lg p-4 hover:bg-neutral-800/30 transition-colors">
                    <Label htmlFor="enterprise" className="flex items-start gap-4 cursor-pointer">
                      <RadioGroupItem value="enterprise" id="enterprise" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-semibold text-white">Enterprise</span>
                          <span className="text-2xl font-bold text-white">$299<span className="text-sm text-neutral-400">/mo</span></span>
                        </div>
                        <ul className="space-y-1">
                          {PLANS.enterprise.features.map((feature, i) => (
                            <li key={i} className="text-sm text-neutral-300 flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </TabsContent>
              
              <TabsContent value="payment" className="space-y-4 mt-6">
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'stripe' | 'crypto')}>
                  <div className="border border-white/20 rounded-lg p-4 hover:bg-neutral-800/30 transition-colors">
                    <Label htmlFor="stripe" className="flex items-center gap-4 cursor-pointer">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <CreditCard className="h-5 w-5 text-white" />
                      <div className="flex-1">
                        <p className="font-semibold text-white">Credit Card</p>
                        <p className="text-sm text-neutral-400">Pay with Stripe (Visa, Mastercard, etc.)</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="border border-white/20 rounded-lg p-4 hover:bg-neutral-800/30 transition-colors opacity-50">
                    <Label htmlFor="crypto" className="flex items-center gap-4 cursor-pointer">
                      <RadioGroupItem value="crypto" id="crypto" disabled />
                      <Bitcoin className="h-5 w-5 text-white" />
                      <div className="flex-1">
                        <p className="font-semibold text-white">Cryptocurrency</p>
                        <p className="text-sm text-neutral-400">Pay with Bitcoin, Ethereum (Coming Soon)</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="w-full border-green-500 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">{success}</AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              {processing ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Zap className="mr-2 h-5 w-5" />
              )}
              Upgrade to {PLANS[selectedPlan as keyof typeof PLANS].name}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
