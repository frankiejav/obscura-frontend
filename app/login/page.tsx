"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false)
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'loading'>('loading')
  const [uptime, setUptime] = useState(0)
  const [startTime] = useState(Date.now())

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  // SYSTEM ONLINE check
  useEffect(() => {
    let isMounted = true
    const checkSystemStatus = async () => {
      try {
        const response = await fetch("/api/system/status")
        if (response.ok) {
          const data = await response.json()
          if (isMounted) setSystemStatus(data.status)
        } else {
          if (isMounted) setSystemStatus("offline")
        }
      } catch {
        if (isMounted) setSystemStatus("offline")
      }
    }
    checkSystemStatus()
    const interval = setInterval(checkSystemStatus, 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // Real-time uptime
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  // Format uptime as HH:MM:SS
  const formatUptime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

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

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background tactical-grid">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground font-mono">REDIRECTING TO DASHBOARD...</p>
        </div>
      </div>
    )
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
              <div className={`status-indicator ${systemStatus === 'online' ? 'status-active' : 'status-inactive'}`}></div>
              <span>SYSTEM {systemStatus === 'loading' ? 'CHECKING...' : systemStatus.toUpperCase()}</span>
              <span className="mx-2">|</span>
              <span>UPTIME: {formatUptime(uptime)}</span>
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