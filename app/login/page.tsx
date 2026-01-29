"use client"

import { useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0'
import { useRouter } from 'next/navigation'
import { motion } from "motion/react"
import Header from '@/components/navigation/header'

function BlueprintIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      {icon === "shield" && (
        <path d="M8 0l7 3v4c0 3.53-2.61 6.74-7 8-4.39-1.26-7-4.47-7-8V3l7-3zm0 1.11L2 3.72V7c0 2.89 2.2 5.55 6 6.72 3.8-1.17 6-3.83 6-6.72V3.72L8 1.11z" fillRule="evenodd" />
      )}
      {icon === "lock" && (
        <path d="M12 7V5c0-2.21-1.79-4-4-4S4 2.79 4 5v2H3v9h10V7h-1zm-5 6.72V12h2v1.72a1 1 0 0 1-.5.86.98.98 0 0 1-1 0 1 1 0 0 1-.5-.86zM5 5c0-1.66 1.34-3 3-3s3 1.34 3 3v2H5V5z" fillRule="evenodd" />
      )}
      {icon === "arrow-top-right" && (
        <path d="M5 3h8v8l-1-1V4.41L4.41 12l-.7-.71L11.29 4H6L5 3z" fillRule="evenodd" />
      )}
    </svg>
  )
}

export default function LoginPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  const handleLogin = () => {
    router.push('/auth/login?returnTo=/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative w-8 h-8 mx-auto">
            <div className="absolute inset-0 border border-[#e9ecef] rounded" />
            <div className="absolute inset-0 border border-transparent border-t-[#e85d2d] rounded animate-spin" />
          </div>
          <p className="mt-4 text-[#adb5bd] text-sm">Loading...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Header />

      <main className="flex items-center justify-center min-h-screen px-6 pt-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-24"
        >
          <div className="bg-white border border-[#e9ecef] rounded p-10">
            <div className="text-center mb-10">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center justify-center w-14 h-14 bg-[#212529] rounded mb-6"
              >
                <BlueprintIcon icon="shield" size={24} className="text-white" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-[28px] font-light text-[#212529] mb-3"
              >
                Welcome back
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-[#868e96] text-sm"
              >
                Access your threat intelligence dashboard
              </motion.p>
              </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="space-y-4"
            >
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                  onClick={handleLogin}
                className="pltr-btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
                >
                <BlueprintIcon icon="lock" size={14} />
                    Sign In with Auth0
                <BlueprintIcon icon="arrow-top-right" size={14} />
              </motion.button>

              <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-[#e9ecef]" />
                  </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-xs text-[#adb5bd] bg-white">or</span>
                  </div>
                </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                  onClick={() => router.push('/auth/login?screen_hint=signup')}
                className="pltr-btn-secondary w-full py-3.5 text-sm"
                >
                  Create New Account
              </motion.button>
            </motion.div>
              </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-8 text-center text-xs text-[#adb5bd]"
          >
              By signing in, you agree to our{' '}
            <a href="/terms-of-service" className="text-[#868e96] hover:text-[#e85d2d] transition-colors">
              Terms
              </a>{' '}
              and{' '}
            <a href="/privacy-policy" className="text-[#868e96] hover:text-[#e85d2d] transition-colors">
                Privacy Policy
              </a>
          </motion.p>
        </motion.div>
      </main>
    </div>
  )
}
