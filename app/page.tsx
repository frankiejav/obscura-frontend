"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Home() {
  const [isSignup, setIsSignup] = useState(false)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background tactical-grid">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground font-mono">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    )
  }

  // Don't show login form if user is already authenticated
  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background tactical-grid">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="flex flex-col items-center gap-4">
          <Image src="/images/obscura-logo-white.png" alt="Obscura" width={200} height={200} className="opacity-90" />
          <div className="text-center">
            <p className="text-lg text-muted-foreground font-mono tracking-wider mt-2 max-w-2xl">
              PRIVATE INTELLIGENCE OPERATIONS DASHBOARD FOR THREAT MONITORING AND DIGITAL IDENTITY SECURITY
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <div className="status-indicator status-active"></div>
              <span>SYSTEM ONLINE</span>
              <span className="mx-2">|</span>
              <span>UPTIME: 72:14:33</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md">
          {isSignup ? <SignupForm /> : <LoginForm />}

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsSignup(!isSignup)}
              className="text-muted-foreground hover:text-primary font-mono text-sm tracking-wider"
            >
              {isSignup ? "← RETURN TO LOGIN" : "CREATE NEW ACCOUNT →"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
