"use client"

import { useEffect, useState, useCallback } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from "@stripe/react-stripe-js"
import { Loader2 } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type BillingCycle = 'monthly' | 'quarterly' | 'yearly'

interface StripeCheckoutProps {
  planName: string
  planPrice: number
  billingCycle?: BillingCycle
}

export default function StripeCheckout({ 
  planName, 
  planPrice,
  billingCycle = 'monthly'
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/payments/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planName,
          planPrice,
          billingCycle,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (err) {
      console.error("Error creating checkout session:", err)
      setError("Failed to initialize payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [planName, planPrice, billingCycle])

  useEffect(() => {
    fetchClientSecret()
  }, [fetchClientSecret])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-neutral-400">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchClientSecret}
            className="px-4 py-2 bg-white text-black rounded hover:bg-neutral-200 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!clientSecret) {
    return null
  }

  const options = {
    clientSecret,
  }

  return (
    <div className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
