"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Header from "@/components/navigation/header"
import PaymentMethodSelector from "@/components/payments/PaymentMethodSelector"
import StripeCheckout from "@/components/payments/StripeCheckout"
import CryptoCheckout from "@/components/payments/CryptoCheckout"
import { Button } from "@/components/ui/button"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto' | null>(null)
  const [planDetails, setPlanDetails] = useState({
    name: '',
    price: 0,
  })

  useEffect(() => {
    // Get plan details from URL params
    const planName = searchParams?.get('plan') || 'Professional'
    const planPrice = parseFloat(searchParams?.get('price') || '99')
    
    setPlanDetails({
      name: planName,
      price: planPrice,
    })
  }, [searchParams])

  const handlePaymentMethodSelect = (method: 'fiat' | 'crypto') => {
    setPaymentMethod(method)
  }

  const handleBack = () => {
    if (paymentMethod) {
      setPaymentMethod(null)
    } else {
      router.push('/pricing')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      
      <main className="min-h-[calc(100vh-80px)] px-4 sm:px-6 py-12">
        <div className="w-full max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={handleBack}
            variant="ghost"
            className="mb-6 text-neutral-400 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {paymentMethod ? 'Change Payment Method' : 'Back to Pricing'}
          </Button>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  !paymentMethod ? 'bg-white text-black' : 'bg-white/20 text-white'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm text-white">Select Payment Method</span>
              </div>
              
              <div className="w-16 h-0.5 bg-white/20"></div>
              
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  paymentMethod ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-500'
                }`}>
                  2
                </div>
                <span className={`ml-2 text-sm ${
                  paymentMethod ? 'text-white' : 'text-neutral-500'
                }`}>
                  Complete Payment
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Content */}
          <div className="mb-12">
            {!paymentMethod && (
              <PaymentMethodSelector
                onSelect={handlePaymentMethodSelect}
                planName={planDetails.name}
                planPrice={planDetails.price}
              />
            )}

            {paymentMethod === 'fiat' && (
              <div className="animate-in fade-in duration-500">
                <StripeCheckout
                  planName={planDetails.name}
                  planPrice={planDetails.price}
                />
              </div>
            )}

            {paymentMethod === 'crypto' && (
              <div className="animate-in fade-in duration-500">
                <CryptoCheckout
                  planName={planDetails.name}
                  planPrice={planDetails.price}
                />
              </div>
            )}
          </div>

          {/* Security Badge */}
          <div className="text-center text-xs text-neutral-500">
            <div className="inline-flex items-center gap-2">
              <svg 
                className="h-4 w-4" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure Payment Processing</span>
            </div>
            <p className="mt-2">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading checkout...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
