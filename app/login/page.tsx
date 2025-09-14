"use client"

import { useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Header from '@/components/navigation/header'
import { Shield, Lock, ArrowRight, Fingerprint, Key, CheckCircle } from "lucide-react"

export default function LoginPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user && !isLoading) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  const handleLogin = () => {
    router.push('/api/auth/login?returnTo=/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-white/30 rounded-full animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <p className="mt-4 text-white/60 text-sm tracking-wide">Loading...</p>
        </div>
      </div>
    )
  }

  const features = [
    { icon: <Shield className="h-5 w-5" />, text: "Enterprise-grade security" },
    { icon: <Fingerprint className="h-5 w-5" />, text: "Multi-factor authentication" },
    { icon: <Key className="h-5 w-5" />, text: "Secure API access" },
  ]

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          {/* Glow effect container */}
          <div className="relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
            
            {/* Main card */}
            <div className="relative bg-neutral-900/60 backdrop-blur-xl rounded-3xl ring-1 ring-white/10 p-8 sm:p-10 hover:ring-white/20 transition-all duration-500">
              {/* Logo and title */}
              <div className="text-center mb-8">
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                  <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-30"></div>
                  <div className="relative bg-white rounded-2xl p-4">
                    <Shield className="h-10 w-10 text-black" />
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                  Welcome Back
                </h1>
                <p className="text-neutral-400 text-sm sm:text-base">
                  Access your identity intelligence dashboard
                </p>
              </div>

              {/* Login button with glow */}
              <div className="space-y-4">
                <Button 
                  onClick={handleLogin}
                  className="group relative w-full py-4 text-base sm:text-lg font-semibold bg-white text-black hover:bg-neutral-200 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] overflow-hidden"
                  size="lg"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <Lock className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    Sign In with Auth0
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-neutral-900/60 px-4 text-neutral-500">Or</span>
                  </div>
                </div>

                <Button 
                  onClick={() => router.push('/api/auth/login?screen_hint=signup')}
                  variant="outline"
                  className="w-full py-4 text-base font-semibold border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                  size="lg"
                >
                  Create New Account
                </Button>
              </div>

              {/* Features list */}
              <div className="mt-8 space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-neutral-400">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      {feature.icon}
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Demo notice */}
              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-300 text-center">
                  <span className="font-semibold">Demo Mode Available</span>
                  <br />
                  <span className="text-xs text-blue-300/80 mt-1 block">
                    Explore with limited features before signing up
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom links */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-xs text-neutral-500">
              By signing in, you agree to our{' '}
              <a href="/terms-of-service" className="text-white/60 hover:text-white transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy-policy" className="text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}