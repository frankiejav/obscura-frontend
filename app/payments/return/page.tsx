"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Header from "@/components/navigation/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentReturnPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams?.get("session_id")
  
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      checkSessionStatus(sessionId)
    } else {
      setError("No session ID provided")
      setLoading(false)
    }
  }, [sessionId])

  const checkSessionStatus = async (id: string) => {
    try {
      const response = await fetch(
        `/api/payments/stripe/session-status?session_id=${id}`
      )
      
      if (!response.ok) {
        throw new Error("Failed to retrieve session status")
      }

      const data = await response.json()
      setSessionData(data)
    } catch (err: any) {
      console.error("Error checking session status:", err)
      setError(err.message || "Failed to verify payment status")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
            <p className="text-white text-lg">Verifying payment...</p>
          </div>
        </div>
      </div>
    )
  }

  const isSuccess = sessionData?.status === 'complete'

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 py-12">
        <div className="w-full max-w-2xl">
          <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/20">
            <CardHeader className="text-center pb-0">
              {isSuccess ? (
                <>
                  <div className="mx-auto mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30"></div>
                      <CheckCircle className="relative h-20 w-20 text-green-400" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-white">
                    Payment Successful!
                  </CardTitle>
                  <CardDescription className="text-neutral-400 mt-2">
                    Your subscription has been activated
                  </CardDescription>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30"></div>
                      <XCircle className="relative h-20 w-20 text-red-400" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-white">
                    Payment {sessionData?.status || 'Failed'}
                  </CardTitle>
                  <CardDescription className="text-neutral-400 mt-2">
                    {error || "Your payment could not be completed"}
                  </CardDescription>
                </>
              )}
            </CardHeader>

            <CardContent className="pt-6">
              {isSuccess && sessionData && (
                <div className="space-y-4 mb-8">
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-neutral-400 text-sm">Amount Paid</p>
                        <p className="text-white font-semibold">
                          ${((sessionData.amountTotal || 0) / 100).toFixed(2)} {sessionData.currency?.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400 text-sm">Email</p>
                        <p className="text-white font-semibold">
                          {sessionData.customerEmail || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-sm text-neutral-400">
                    <p>A confirmation email has been sent to your registered email address.</p>
                    <p className="mt-2">Your subscription ID: <span className="text-white font-mono">{sessionData.subscription}</span></p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                {isSuccess ? (
                  <>
                    <Button
                      onClick={() => router.push('/dashboard')}
                      className="flex-1 bg-white text-black hover:bg-neutral-200"
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      onClick={() => router.push('/dashboard/settings')}
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      Manage Subscription
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => router.push('/pricing')}
                      className="flex-1 bg-white text-black hover:bg-neutral-200"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={() => router.push('/contact')}
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      Contact Support
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
