"use client"

import { useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Shield, Lock } from "lucide-react"

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
    router.push('/auth/login?returnTo=/dashboard')
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="bg-neutral-900/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/symbolwhite.png" alt="Obscura Labs" width={32} height={32} priority />
            <span className="text-lg font-semibold text-white">OBSCURA LABS</span>
          </div>
          <Link 
            href="/" 
            className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="w-full max-w-md">
          <div className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl ring-1 ring-white/10 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6">
                <Shield className="h-8 w-8 text-black" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Access Dashboard</h1>
              <p className="text-neutral-300">
                Secure authentication powered by Auth0
              </p>
            </div>

            <div className="space-y-6">
              <Button 
                onClick={handleLogin}
                className="w-full py-3 text-lg font-semibold bg-white text-black hover:bg-neutral-200 transition-all duration-300"
                size="lg"
              >
                <Lock className="mr-2 h-5 w-5" />
                Sign In/Sign Up with Auth0
              </Button>

              <div className="text-center">
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
          </div>
        </div>
      </main>
    </div>
  )
}