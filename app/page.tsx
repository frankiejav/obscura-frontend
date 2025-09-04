"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Eye, Target, Users, ArrowRight, Database, Bell, Key, BarChart3, Settings, Search, Monitor, Shield, Lock, AlertTriangle, Globe, Zap, TrendingUp, CheckCircle, Download } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const overviewBullets = [
    "Large-scale ingestion from stealer logs, breaches, phishing kits, and underground sources",
    "Normalization and correlation across emails, usernames, devices, and sessions",
    "Automated monitoring for domains, employees, and high-risk cohorts",
    "API, webhooks, and bulk export for downstream systems"
  ]

  const capabilities = [
    {
      icon: <Search className="h-6 w-6 text-white/80" />,
      title: "Exposure Search",
      description: "Query emails, domains, usernames, phone numbers, IPs, and device traits across recaptured datasets."
    },
    {
      icon: <Shield className="h-6 w-6 text-white/80" />,
      title: "Session Hijack Detection",
      description: "Identify malware-stolen cookies and tokens that enable account takeover."
    },
    {
      icon: <Monitor className="h-6 w-6 text-white/80" />,
      title: "Domain & Employee Monitoring",
      description: "Track corporate domains and staff identities for fresh exposures."
    },
    {
      icon: <Key className="h-6 w-6 text-white/80" />,
      title: "Credential Recapture",
      description: "Detect credential reuse and password exposures across sources."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-white/80" />,
      title: "Risk Scoring",
      description: "Correlate multi-source evidence into prioritized identity risk."
    },
    {
      icon: <Settings className="h-6 w-6 text-white/80" />,
      title: "API & Integrations",
      description: "Stream results to SIEM/IdP/SOAR and internal tools with webhooks and bulk export."
    }
  ]

  const processSteps = [
    "Ingest — Continuously collect stealer logs, breach dumps, and phishing harvests.",
    "Normalize — Parse, deduplicate, and map identities, credentials, and session artifacts.",
    "Correlate — Link personas across sources; detect reuse and high-risk overlaps.",
    "Score — Prioritize exposures with evidence and suggested remediation.",
    "Deliver — Dashboard, alerts, API/webhooks, and exports for rapid action."
  ]

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-neutral-900/80 backdrop-blur-md border-b border-white/10' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/symbolwhite.png" alt="Obscura Labs" width={32} height={32} priority />
            <span className="text-lg font-semibold text-white">OBSCURA LABS</span>
          </div>
        </div>
      </header>

      <section className="relative py-32 px-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
              Identity Exposure
              <span className="block text-white">
                Intelligence
              </span>
            </h1>
            <p className="text-xl text-neutral-200 mb-12 max-w-4xl mx-auto leading-relaxed">
              Obscura Labs detects and correlates compromised identities from stealer logs, breach collections, phishing kits, and malware-exfiltrated data—then delivers automated monitoring, alerts, and API access for rapid remediation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold bg-white text-black hover:bg-neutral-200 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => router.push('/login')}
              >
                Open Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="#overview">
                <Button 
                  variant="outline"
                  size="lg" 
                  className="px-8 py-4 text-lg font-semibold border border-white/20 hover:border-white/40 text-white hover:bg-white/5 transition-all duration-300"
                >
                  Platform Overview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="overview" className="py-24 px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">What is Obscura Labs</h2>
            <p className="text-lg text-neutral-200 max-w-4xl mx-auto leading-relaxed mb-8">
              Obscura Labs is an identity threat intelligence platform. We continuously collect stealer logs, breach dumps, and phishing harvests, recapture session artifacts (cookies/tokens), normalize identities across sources, and score risk. Security teams use our dashboard and API to search exposures, monitor employee and consumer identities, and automate remediation via integrations with their SIEM/IdP/SOAR.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {overviewBullets.map((bullet, index) => (
                <div key={index} className="flex items-start gap-3 text-left">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-neutral-200">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Platform Capabilities</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <div key={index} className="group p-8 rounded-2xl bg-neutral-900/60 backdrop-blur-sm ring-1 ring-white/10 hover:ring-white/20 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {capability.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{capability.title}</h3>
                    <p className="text-neutral-200 leading-relaxed">{capability.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-neutral-950">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">How It Works</h2>
          </div>
          <div className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl ring-1 ring-white/10 p-8">
            <div className="space-y-6">
              {processSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-neutral-200 text-lg font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-neutral-950">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <div className="bg-neutral-900/60 backdrop-blur-sm p-12 rounded-2xl ring-1 ring-white/10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6">
                <Users className="h-8 w-8 text-black" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">For Security, Fraud, and DFIR</h2>
              <p className="text-neutral-200 text-lg leading-relaxed max-w-2xl mx-auto">
                Reduce account takeover, stop session hijack, and accelerate investigations. Monitor your workforce and consumer populations, automate containment via identity and access tools, and export enriched evidence for casework.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-neutral-900">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="text-white flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6">Start Monitoring Identities</h2>
            <p className="text-xl text-neutral-200 mb-8 max-w-2xl">
              Search exposures, enable domain monitoring, and connect the API.
            </p>
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold bg-white text-black hover:bg-neutral-200 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => router.push('/login')}
            >
              Open Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-neutral-950 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image src="/images/symbolwhite.png" alt="Obscura Labs" width={24} height={24} />
            <span className="text-lg font-semibold text-white">OBSCURA LABS</span>
          </div>
          <p className="text-sm text-neutral-300">
            © {new Date().getFullYear()} Obscura Labs. Identity threat intelligence platform for security teams.
          </p>
        </div>
      </footer>
    </div>
  )
}
