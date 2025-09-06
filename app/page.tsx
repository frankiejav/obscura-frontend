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
  const [liveStats, setLiveStats] = useState([
    {
      icon: <Key className="h-8 w-8 text-white" />,
      number: "1,725,762",
      label: "Total Credentials"
    },
    {
      icon: <Database className="h-8 w-8 text-white" />,
      number: "44,204,833",
      label: "Total Cookies"
    }
  ])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const response = await fetch('/api/public/stats')
        if (response.ok) {
          const data = await response.json()
          setLiveStats([
            {
              icon: <Key className="h-8 w-8 text-white" />,
              number: data.credentials_24h.toLocaleString(),
              label: "Total Credentials"
            },
            {
              icon: <Database className="h-8 w-8 text-white" />,
              number: data.cookies_24h.toLocaleString(),
              label: "Total Cookies"
            }
          ])
        }
      } catch (error) {
        console.error('Failed to fetch live stats:', error)
        // Keep fallback numbers if API fails
      }
    }

    fetchLiveStats()
    // Refresh every 5 minutes
    const interval = setInterval(fetchLiveStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const overviewBullets = [
    "Continous large-scale data ingestion from breached databases, ransomware leaks and stealer logs",
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
      description: "Track corporate domains and staff identities for fresh exposures.",
      comingSoon: true
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
      description: "Stream results to SIEM/IdP/SOAR and internal tools with webhooks and bulk export.",
      comingSoon: true
    }
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
                      <Button 
              variant="outline"
              size="sm"
              className="border border-white/20 hover:border-white/40 text-white hover:bg-white/5 transition-all duration-300"
              onClick={() => router.push('/login')}
            >
              Access Dashboard
            </Button>
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
              Obscura Labs detects and correlates compromised identities from breached databases, ransomware leaks and malware-exfiltrated data—then delivers automated monitoring, alerts, and API access for rapid remediation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold bg-white text-black hover:bg-neutral-200 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => router.push('/login')}
              >
                Access Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/login">
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
              Obscura Labs is an identity threat intelligence platform. We continuously collect breach dumps, ransomware leaks and stealer logs, recapture login credentials and session artifacts (cookies/tokens), normalize identities across sources, and score risk. Security teams use our dashboard and API to search exposures, monitor employee and consumer identities, and automate remediation via integrations with their SIEM/IdP/SOAR.
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
              <div key={index} className="group p-8 rounded-2xl bg-neutral-900/60 backdrop-blur-sm ring-1 ring-white/10 hover:ring-white/20 transition-all duration-300 hover:-translate-y-0.5 relative">
                {capability.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 text-xs font-medium bg-neutral-700 text-neutral-300 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                )}
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
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <h2 className="text-4xl font-bold text-white">Live Record Count</h2>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {liveStats.map((stat, index) => (
              <div key={index} className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl ring-1 ring-white/10 p-6 text-center hover:ring-white/20 transition-all duration-300">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-lg font-medium text-neutral-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-neutral-950">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="bg-neutral-900/60 backdrop-blur-sm p-12 rounded-2xl ring-1 ring-white/10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6">
                <Shield className="h-8 w-8 text-black" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">Law Enforcement & Research Access</h2>
              <p className="text-neutral-200 text-lg leading-relaxed max-w-3xl mx-auto mb-8">
                We provide full database access to approved law enforcement agencies and academic researchers investigating cybercrime, identity theft, and data breaches.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="text-left p-6 bg-neutral-800/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Law Enforcement</h3>
                  </div>
                  <ul className="space-y-2 text-neutral-200">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Full database access for criminal investigations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Real-time alerts for high-priority targets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Bulk export capabilities for case evidence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Dedicated support and training</span>
                    </li>
                  </ul>
                </div>
                
                <div className="text-left p-6 bg-neutral-800/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Search className="h-4 w-4 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Academic Research</h3>
                  </div>
                  <ul className="space-y-2 text-neutral-200">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Anonymized datasets for cybersecurity research</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>API access for automated analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Collaboration on threat intelligence studies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Publication and citation support</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-neutral-800/30 rounded-lg border border-neutral-700">
                <p className="text-sm text-neutral-300">
                  <strong className="text-white">Approval Process:</strong> All access requests undergo verification of credentials, 
                  institutional affiliation, and intended use case. Contact us with your official request and documentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-neutral-900">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="text-white flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6">Start Monitoring Identities</h2>
            <p className="text-xl text-neutral-200 mb-8 max-w-2xl">
              Search exposures, enable domain monitoring, and connect to our
               API.
            </p>
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold bg-white text-black hover:bg-neutral-200 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => router.push('/login')}
            >
              Access Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-neutral-950 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image src="/images/symbolwhite.png" alt="Obscura Labs" width={24} height={24} />
            <span className="text-lg font-semibold text-white">OBSCURA LABS</span>
          </div>
          
          <div className="flex items-center justify-center gap-8 mb-6">
            <Link 
              href="/privacy-policy" 
              className="text-neutral-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Privacy Policy
            </Link>
            <div className="w-1 h-1 bg-neutral-500 rounded-full"></div>
            <Link 
              href="/terms-of-service" 
              className="text-neutral-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Terms of Service
            </Link>
          </div>
          
          <p className="text-sm text-neutral-300">
            © {new Date().getFullYear()} Obscura Labs LLC. Identity threat intelligence platform.
          </p>
        </div>
      </footer>
    </div>
  )
}
