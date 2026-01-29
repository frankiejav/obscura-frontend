"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BlueprintIcon } from '@/components/ui/blueprint-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

type PlanKey = 'free' | 'starter' | 'professional' | 'enterprise'

interface PlanInfo {
  name: string
  price: string
  period: string
  priceMonthly?: number
  priceYearly?: number
  features: string[]
}

const PLANS: Record<PlanKey, PlanInfo> = {
  free: {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Basic search (redacted)',
      '10 searches/day',
      'Community support',
    ]
  },
  starter: {
    name: 'Starter',
    price: '$19.99',
    period: '/month',
    priceMonthly: 19.99,
    priceYearly: 191.88,
    features: [
      '200 lookups/day',
      'Dashboard access',
      'CSV/JSON exports',
      'Email support',
    ]
  },
  professional: {
    name: 'Professional',
    price: '$49',
    period: '/month',
    priceMonthly: 49,
    priceYearly: 349,
    features: [
      'Unlimited lookups',
      '10,000 API credits/month',
      'Credential monitoring',
      'Full API access',
      'Team collaboration',
      'Priority support',
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: '$299',
    period: '/month',
    priceMonthly: 299,
    priceYearly: 2868,
    features: [
      'Everything in Professional',
      'Unlimited API credits',
      'Real-time feeds',
      'Custom analytics',
      'Unlimited monitoring',
      '24/7 dedicated support',
    ]
  }
}

export default function SubscriptionManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<PlanKey>('free')
  const [subscription, setSubscription] = useState<any>(null)
  const [entitlements, setEntitlements] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchEntitlements()
  }, [])

  const normalizePlan = (plan: string): PlanKey => {
    const normalized = plan?.toLowerCase() || 'free'
    if (normalized === 'pro') return 'professional'
    if (['free', 'starter', 'professional', 'enterprise'].includes(normalized)) {
      return normalized as PlanKey
    }
    return 'free'
  }

  const fetchEntitlements = async () => {
    try {
      const token = localStorage.getItem('auth_token')
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
      setCurrentPlan(normalizePlan(data.plan))
      setSubscription(data.subscription)
    } catch (err: any) {
      console.error('Error fetching entitlements:', err)
      setError('Failed to load subscription information')
    } finally {
      setLoading(false)
    }
  }

  const getSelectedPrice = () => {
    const plan = PLANS[selectedPlan]
    if (billingCycle === 'yearly' && plan.priceYearly) {
      return plan.priceYearly
    }
    return plan.priceMonthly || 0
  }

  const handleCheckout = async () => {
    setProcessing(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('auth_token')
      const price = getSelectedPrice()
      const planDisplayName = selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)
      
      if (paymentMethod === 'stripe') {
        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            planName: planDisplayName,
            planPrice: price,
            billingCycle,
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
        window.location.href = `/checkout?plan=${planDisplayName}&price=${price}&cycle=${billingCycle}`
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
        <BlueprintIcon icon="refresh" size={32} className="animate-spin text-white" />
      </div>
    )
  }

  const isFreePlan = currentPlan === 'free'
  const canUpgrade = currentPlan !== 'enterprise'
  const currentPlanInfo = PLANS[currentPlan]
  
  const getUpgradePlans = (): ('starter' | 'professional' | 'enterprise')[] => {
    switch (currentPlan) {
      case 'free':
        return ['starter', 'professional', 'enterprise']
      case 'starter':
        return ['professional', 'enterprise']
      case 'professional':
        return ['enterprise']
      default:
        return []
    }
  }
  
  const upgradePlans = getUpgradePlans()

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
              {currentPlanInfo.name}
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
                      <BlueprintIcon icon="tick-circle" size={16} className="text-green-500" />
                      <span className="text-white font-semibold">Active</span>
                    </>
                  ) : subscription.isPastDue ? (
                    <>
                      <BlueprintIcon icon="error" size={16} className="text-yellow-500" />
                      <span className="text-white font-semibold">Past Due</span>
                    </>
                  ) : (
                    <>
                      <BlueprintIcon icon="cross-circle" size={16} className="text-red-500" />
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
                  <BlueprintIcon icon="refresh" size={16} className="mr-2 animate-spin" />
                ) : (
                  <BlueprintIcon icon="credit-card" size={16} className="mr-2" />
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
                <div className="flex justify-center mb-4">
                  <div className="inline-flex items-center bg-neutral-800/50 rounded-full p-1">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                        billingCycle === 'monthly'
                          ? 'bg-white text-black'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-2 ${
                        billingCycle === 'yearly'
                          ? 'bg-white text-black'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Yearly
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        billingCycle === 'yearly' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        Save 20%+
                      </span>
                    </button>
                  </div>
                </div>
                
                <RadioGroup 
                  value={selectedPlan} 
                  onValueChange={(v) => setSelectedPlan(v as 'starter' | 'professional' | 'enterprise')}
                >
                  {upgradePlans.map((planKey) => {
                    const plan = PLANS[planKey]
                    const price = billingCycle === 'yearly' && plan.priceYearly 
                      ? Math.round(plan.priceYearly / 12) 
                      : plan.priceMonthly || 0
                    const yearlyTotal = plan.priceYearly || 0
                    
                    return (
                      <div 
                        key={planKey}
                        className={`border rounded-lg p-4 transition-colors ${
                          selectedPlan === planKey 
                            ? 'border-white/40 bg-neutral-800/50' 
                            : 'border-white/20 hover:bg-neutral-800/30'
                        }`}
                      >
                        <Label htmlFor={planKey} className="flex items-start gap-4 cursor-pointer">
                          <RadioGroupItem value={planKey} id={planKey} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg font-semibold text-white">{plan.name}</span>
                              <div className="text-right">
                                <span className="text-2xl font-bold text-white">
                                  ${price}
                                  <span className="text-sm text-neutral-400">/mo</span>
                                </span>
                                {billingCycle === 'yearly' && (
                                  <div className="text-xs text-neutral-500">
                                    ${yearlyTotal}/year
                                  </div>
                                )}
                              </div>
                            </div>
                            <ul className="space-y-1">
                              {plan.features.map((feature, i) => (
                                <li key={i} className="text-sm text-neutral-300 flex items-center gap-2">
                                  <BlueprintIcon icon="tick-circle" size={12} className="text-green-500 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </TabsContent>
              
              <TabsContent value="payment" className="space-y-4 mt-6">
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'stripe' | 'crypto')}>
                  <div className={`border rounded-lg p-4 transition-colors ${
                    paymentMethod === 'stripe' 
                      ? 'border-white/40 bg-neutral-800/50' 
                      : 'border-white/20 hover:bg-neutral-800/30'
                  }`}>
                    <Label htmlFor="stripe" className="flex items-center gap-4 cursor-pointer">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <BlueprintIcon icon="credit-card" size={20} className="text-white" />
                      <div className="flex-1">
                        <p className="font-semibold text-white">Credit Card</p>
                        <p className="text-sm text-neutral-400">Pay with Stripe (Visa, Mastercard, etc.)</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className={`border rounded-lg p-4 transition-colors ${
                    paymentMethod === 'crypto' 
                      ? 'border-white/40 bg-neutral-800/50' 
                      : 'border-white/20 hover:bg-neutral-800/30'
                  }`}>
                    <Label htmlFor="crypto" className="flex items-center gap-4 cursor-pointer">
                      <RadioGroupItem value="crypto" id="crypto" />
                      <BlueprintIcon icon="bitcoin" size={20} className="text-white" />
                      <div className="flex-1">
                        <p className="font-semibold text-white">Cryptocurrency</p>
                        <p className="text-sm text-neutral-400">Pay with Bitcoin, Ethereum, USDT, and more</p>
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
                <BlueprintIcon icon="error" size={16} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="w-full border-green-500 bg-green-500/10">
                <BlueprintIcon icon="tick-circle" size={16} className="text-green-500" />
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
                <BlueprintIcon icon="refresh" size={20} className="mr-2 animate-spin" />
              ) : (
                <BlueprintIcon icon="lightning" size={20} className="mr-2" />
              )}
              Upgrade to {PLANS[selectedPlan].name} ({billingCycle === 'yearly' ? 'Annual' : 'Monthly'})
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
