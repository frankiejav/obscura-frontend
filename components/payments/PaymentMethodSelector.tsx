"use client"

import { useState } from "react"
import { CreditCard, Bitcoin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PaymentMethodSelectorProps {
  onSelect: (method: 'fiat' | 'crypto') => void
  planName: string
  planPrice: number
}

export default function PaymentMethodSelector({ 
  onSelect, 
  planName, 
  planPrice 
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'fiat' | 'crypto' | null>(null)

  const handleSelect = (method: 'fiat' | 'crypto') => {
    setSelectedMethod(method)
    onSelect(method)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Choose Payment Method
        </h2>
        <p className="text-neutral-400">
          Select how you'd like to pay for your {planName} plan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fiat Payment Card */}
        <Card 
          className={`bg-neutral-900/60 backdrop-blur-xl border cursor-pointer transition-all duration-300 ${
            selectedMethod === 'fiat' 
              ? 'border-white ring-2 ring-white' 
              : 'border-white/20 hover:border-white/40'
          }`}
          onClick={() => handleSelect('fiat')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CreditCard className="h-8 w-8 text-white" />
              {selectedMethod === 'fiat' && (
                <div className="h-4 w-4 rounded-full bg-white"></div>
              )}
            </div>
            <CardTitle className="text-white mt-4">Card Payment</CardTitle>
            <CardDescription className="text-neutral-400">
              Pay with credit or debit card
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• Instant processing</li>
              <li>• Secure with Stripe</li>
              <li>• All major cards accepted</li>
              <li>• Recurring billing available</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-neutral-500">
                Powered by Stripe
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Crypto Payment Card */}
        <Card 
          className={`bg-neutral-900/60 backdrop-blur-xl border cursor-pointer transition-all duration-300 ${
            selectedMethod === 'crypto' 
              ? 'border-white ring-2 ring-white' 
              : 'border-white/20 hover:border-white/40'
          }`}
          onClick={() => handleSelect('crypto')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <Bitcoin className="h-8 w-8 text-white" />
              {selectedMethod === 'crypto' && (
                <div className="h-4 w-4 rounded-full bg-white"></div>
              )}
            </div>
            <CardTitle className="text-white mt-4">Cryptocurrency</CardTitle>
            <CardDescription className="text-neutral-400">
              Pay with Bitcoin, ETH, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• 50+ cryptocurrencies</li>
              <li>• Non-custodial</li>
              <li>• Lower fees</li>
              <li>• Anonymous payments</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-neutral-500">
                Powered by NOWPayments
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-neutral-400">
          Amount to pay: <span className="font-bold text-white">${planPrice}</span>
        </p>
      </div>
    </div>
  )
}
