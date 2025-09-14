"use client"

import { Button } from "@/components/ui/button"
import Header from '@/components/navigation/header'
import { Shield, Lock, Mail, AlertCircle, Users, Clock } from "lucide-react"

export default function RestrictedPage() {
  const features = [
    { icon: <Shield className="h-5 w-5" />, text: "Early access to threat intelligence" },
    { icon: <Users className="h-5 w-5" />, text: "Join our beta testing program" },
    { icon: <Clock className="h-5 w-5" />, text: "Be notified when we launch" },
  ]

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          {/* Glow effect container */}
          <div className="relative">
            {/* Background glow - orange/red theme for restricted */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-3xl"></div>
            
            {/* Main card */}
            <div className="relative bg-neutral-900/60 backdrop-blur-xl rounded-3xl ring-1 ring-white/10 p-8 sm:p-10 hover:ring-white/20 transition-all duration-500">
              {/* Logo and title */}
              <div className="text-center mb-8">
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                  <div className="absolute inset-0 bg-orange-500 rounded-2xl blur-xl opacity-30"></div>
                  <div className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4">
                    <Lock className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                  Coming Soon
                </h1>
                <p className="text-neutral-400 text-sm sm:text-base">
                  We're currently in private beta
                </p>
              </div>

              {/* Alert message */}
              <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-orange-300 font-semibold mb-1">
                      Restricted Access
                    </p>
                    <p className="text-xs text-orange-300/80">
                      Access to Obscura Labs is currently limited to approved testers and partners.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact section */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-white mb-4">
                    Interested in becoming a beta tester?
                  </p>
                  <p className="text-neutral-400 text-sm mb-6">
                    Contact us to request early access to our identity intelligence platform.
                  </p>
                </div>

                <a 
                  href="mailto:contact@obscuralabs.io?subject=Beta Access Request&body=I would like to request access to the Obscura Labs beta program."
                  className="block"
                >
                  <Button 
                    className="group relative w-full py-4 text-base sm:text-lg font-semibold bg-white text-black hover:bg-neutral-200 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] overflow-hidden"
                    size="lg"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <Mail className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      contact@obscuralabs.io
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </Button>
                </a>
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

              {/* Additional info */}
              <div className="mt-8 p-4 bg-neutral-800/50 border border-white/10 rounded-xl">
                <p className="text-sm text-neutral-300 text-center">
                  <span className="font-semibold">Why Restricted Access?</span>
                  <br />
                  <span className="text-xs text-neutral-400 mt-1 block">
                    We're carefully onboarding users to ensure the highest quality service and security standards during our beta phase.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom links */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-xs text-neutral-500">
              Learn more about our{' '}
              <a href="/about" className="text-white/60 hover:text-white transition-colors">
                mission
              </a>{' '}
              and{' '}
              <a href="/solutions" className="text-white/60 hover:text-white transition-colors">
                solutions
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
