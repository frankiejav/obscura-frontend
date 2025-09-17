"use client"

import { useRouter } from "next/navigation"
import { CheckCircle, Bitcoin, ArrowRight } from "lucide-react"
import Header from "@/components/navigation/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CryptoSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 py-12">
        <div className="w-full max-w-2xl">
          <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/20">
            <CardHeader className="text-center pb-0">
              <div className="mx-auto mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30"></div>
                  <div className="relative bg-green-500/20 rounded-full p-4">
                    <CheckCircle className="h-16 w-16 text-green-400" />
                  </div>
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold text-white">
                Crypto Payment Confirmed!
              </CardTitle>
              
              <CardDescription className="text-neutral-400 mt-2">
                Your cryptocurrency payment has been successfully processed
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Confirmation Details */}
                <div className="bg-neutral-800/50 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-center gap-2 text-white">
                    <Bitcoin className="h-5 w-5" />
                    <span className="font-semibold">Transaction Complete</span>
                  </div>
                  
                  <div className="text-center text-sm text-neutral-400 space-y-2">
                    <p>Your subscription has been activated immediately.</p>
                    <p>A confirmation email with transaction details has been sent to your registered email.</p>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-3">
                  <p className="text-white font-semibold text-center">What's Next?</p>
                  <div className="space-y-2 text-sm text-neutral-300">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                      <span>Access your dashboard to start using all features</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                      <span>Configure your monitoring preferences in settings</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                      <span>Start searching our extensive breach database</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 bg-white text-black hover:bg-neutral-200 group"
                    size="lg"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/dashboard/settings')}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    size="lg"
                  >
                    View Subscription
                  </Button>
                </div>

                {/* Footer Note */}
                <div className="text-center text-xs text-neutral-500 pt-4 border-t border-white/10">
                  <p>Thank you for choosing crypto payment!</p>
                  <p className="mt-1">Payment processed securely via NOWPayments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
