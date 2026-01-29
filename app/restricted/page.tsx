"use client"

import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import Image from "next/image"

export default function RestrictedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#e9ecef] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(206,212,218,0.5) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(173,181,189,0.3) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="mb-8"
        >
          <Image 
            src="/images/symbol.svg" 
            alt="Obscura Labs" 
            width={64} 
            height={64}
            className="opacity-40"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-[28px] sm:text-[36px] font-light text-[#495057] tracking-[-0.02em] mb-4"
        >
          Access Restricted
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-[#868e96] text-sm sm:text-base leading-relaxed max-w-sm"
        >
          This platform is currently in private beta. Access is limited to approved partners and testers.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 pb-12"
      >
        <button 
          onClick={() => router.push('/')}
          className="text-[#868e96] hover:text-[#495057] text-sm transition-colors duration-200 flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.29 7.29L1.29 11.29c-.18.18-.29.43-.29.71s.11.53.29.71l4 4 1.41-1.41L3.41 12H15v-2H3.41l3.29-3.29-1.41-1.42z" fillRule="evenodd" />
          </svg>
          Return to Home
        </button>
      </motion.div>
    </div>
  )
}
