"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Eye, Target, Users, ArrowRight, Database, Bell, Key, BarChart3, Settings, Search, Monitor, Shield, Lock, AlertTriangle, Globe, Zap, TrendingUp, CheckCircle, Download, DollarSign } from "lucide-react"
import "./animations.css"

export default function LandingPage() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [visibleSections, setVisibleSections] = useState(new Set())
  
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

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id))
            // Add animation class to elements within the section
            entry.target.querySelectorAll('.animate-on-scroll').forEach((el, index) => {
              setTimeout(() => {
                el.classList.add('animated')
              }, index * 100)
            })
          }
        })
      },
      { 
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    return () => {
      sections.forEach((section) => observer.unobserve(section))
    }
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
    "Continuous aggregation of database breaches, ransomware leaks, and stealer logs",
    "Advanced normalization across emails, usernames, devices, and sessions",
    "Real-time monitoring for domains and identity exposures",
    "API access and bulk export capabilities for research"
  ]

  const capabilities = [
    {
      icon: <Search className="h-6 w-6 text-white/80" />,
      title: "Exposure Search",
      description: "Query emails, domains, usernames, phone numbers, IPs, and device fingerprints across all collected threat data."
    },
    {
      icon: <Shield className="h-6 w-6 text-white/80" />,
      title: "Session Hijack Detection",
      description: "Identify stolen cookies and authentication tokens from compromised systems."
    },
    {
      icon: <Monitor className="h-6 w-6 text-white/80" />,
      title: "Identity Monitoring",
      description: "Real-time monitoring for domains and identities with instant alerts on new exposures."
    },
    {
      icon: <Key className="h-6 w-6 text-white/80" />,
      title: "Credential Analysis",
      description: "Track password exposures and credential patterns across all data sources."
    },
    {
      icon: <Database className="h-6 w-6 text-white/80" />,
      title: "Data Normalization",
      description: "Advanced correlation and deduplication across billions of records."
    },
    {
      icon: <Download className="h-6 w-6 text-white/80" />,
      title: "API & Export",
      description: "Programmatic access and bulk export for security research and analysis."
    }
  ]



  return (
    <div className="min-h-screen bg-neutral-950">
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-neutral-900/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/50' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <Image src="/images/symbolwhite.png" alt="Obscura Labs" width={32} height={32} priority className="group-hover:scale-110 transition-transform duration-300" />
            <span className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">OBSCURA LABS</span>
          </div>
                      <Link href="/login">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                className="relative border border-white/20 hover:border-white/40 text-white hover:bg-white/10 transition-all duration-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] group overflow-hidden touch-manipulation text-sm sm:text-base px-3 sm:px-4 py-2"
              >
                <span className="relative z-10">Access Dashboard</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </Link>
        </div>
      </header>

      <section id="hero" className="relative py-20 md:py-32 px-4 sm:px-6 bg-gradient-to-b from-neutral-900 to-neutral-950 overflow-hidden min-h-screen flex items-center">
        {/* Animated background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
          {/* Floating orbs - responsive sizes */}
          <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-white/5 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10 w-full">
          <div className="text-center mb-8 md:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 md:mb-8 tracking-tight leading-tight animate-fade-in-up px-4">
              <span className="inline-block hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-white hover:to-gray-400 transition-all duration-500">
                Identity Exposure
              </span>
              <span className="block text-white">
                <span className="inline-block hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-white hover:to-gray-400 transition-all duration-500">
                  Intelligence
                </span>
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-neutral-200 mb-4 md:mb-6 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200 px-4">
              Continuous aggregation of database breaches, ransomware leaks, and stealer logs. Real-time intelligence for cybersecurity research.
            </p>
            
            <p className="text-base sm:text-lg text-neutral-300 mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-400 px-4">
              Monitor any email address, phone number, username, or domain for exposed credentials and session data. Get instant alerts when identities you're tracking appear in newly collected threat data.
            </p>
            
            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8 md:mb-12 px-4">
              <div className="flex flex-col items-center group animate-fade-in-up animation-delay-600">
                <div className="relative">
                  <Database className="h-8 w-8 text-white mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-white/30 transition-all duration-300" />
                </div>
                <div className="text-2xl font-bold text-white mb-1 counting-animation">6.5B+</div>
                <div className="text-sm text-neutral-300">Normalized Records</div>
              </div>
              <div className="flex flex-col items-center group animate-fade-in-up animation-delay-700">
                <div className="relative">
                  <Zap className="h-8 w-8 text-white mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-white/30 transition-all duration-300" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">&lt; 1 min</div>
                <div className="text-sm text-neutral-300">Alert Latency</div>
              </div>
              <div className="flex flex-col items-center group animate-fade-in-up animation-delay-800">
                <div className="relative">
                  <Globe className="h-8 w-8 text-white mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-white/30 transition-all duration-300" />
                </div>
                <div className="text-2xl font-bold text-white mb-1 counting-animation">500K+</div>
                <div className="text-sm text-neutral-300">Daily New Entries</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-in-up animation-delay-1000 px-4">
              <Link href="/login">
                <Button 
                  type="button"
                  size="lg" 
                  className="relative min-w-[200px] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-white text-black hover:bg-neutral-200 shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-500 group overflow-hidden touch-manipulation"
                >
                  <span className="relative z-10 flex items-center">
                    Access Dashboard
                    <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button 
                  type="button"
                  variant="outline"
                  size="lg" 
                  className="relative min-w-[200px] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold border border-white/20 hover:border-white/40 text-white hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-500 group overflow-hidden touch-manipulation"
                >
                  <span className="relative z-10 flex items-center">
                    <DollarSign className="mr-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:rotate-12 transition-transform duration-300" />
                    View Pricing
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="overview" className={`py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-neutral-950 transition-all duration-1000 ${
        visibleSections.has('overview') ? 'opacity-100 translate-y-0' : 'opacity-100'
      }`}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16 px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 md:mb-6 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-white hover:to-gray-400 transition-all duration-500 cursor-default animate-on-scroll">Platform Overview</h2>
            <p className="text-base sm:text-lg text-neutral-200 max-w-4xl mx-auto leading-relaxed mb-8 md:mb-12 animate-on-scroll">
              Obscura Labs continuously aggregates and normalizes database breaches, ransomware leaks, and stealer logs to provide comprehensive identity threat intelligence. Our platform continuously collects compromised credentials and session data, making it searchable and monitorable for cybersecurity research.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto mb-12 md:mb-16 px-4">
            {overviewBullets.map((bullet, index) => (
              <div key={index} className="flex items-start gap-3 text-left">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-neutral-200">{bullet}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
            {capabilities.map((capability, index) => (
              <div 
                key={index} 
                className="group p-6 sm:p-8 rounded-2xl bg-neutral-900/60 backdrop-blur-sm ring-1 ring-white/10 hover:ring-white/30 transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)] relative overflow-hidden animate-on-scroll"
                style={{
                  animationDelay: `${index * 100}ms`,
                  opacity: visibleSections.has('overview') ? 1 : 0.8,
                  transform: visibleSections.has('overview') ? 'translateY(0)' : 'translateY(0)',
                  transition: 'all 0.8s ease'
                }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex gap-4 relative z-10">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {capability.icon}
                      <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">{capability.title}</h3>
                    <p className="text-neutral-200 leading-relaxed">{capability.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="stats" className={`py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-neutral-950 transition-all duration-1000 ${
        visibleSections.has('stats') ? 'opacity-100 translate-y-0' : 'opacity-100'
      }`}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16 px-4">
            <div className="flex items-center justify-center gap-3 mb-4 md:mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-white hover:to-gray-400 transition-all duration-500 cursor-default animate-on-scroll">Live Record Count</h2>
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto px-4">
            {liveStats.map((stat, index) => (
              <div 
                key={index} 
                className="group bg-neutral-900/60 backdrop-blur-sm rounded-2xl ring-1 ring-white/10 p-6 text-center hover:ring-white/30 transition-all duration-500 hover:shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:-translate-y-1 relative overflow-hidden animate-on-scroll"
                style={{
                  animationDelay: `${index * 200}ms`,
                  opacity: visibleSections.has('stats') ? 1 : 0.8,
                  transform: visibleSections.has('stats') ? 'translateY(0) scale(1)' : 'translateY(0) scale(1)',
                  transition: 'all 0.8s ease'
                }}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    <div className="relative group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                      <div className="absolute inset-0 bg-white/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">{stat.number}</div>
                  <div className="text-lg font-medium text-neutral-200">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="law-enforcement" className={`py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-neutral-950 transition-all duration-1000 ${
        visibleSections.has('law-enforcement') ? 'opacity-100 translate-y-0' : 'opacity-100'
      }`}>
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 px-4">
            <div className="group bg-neutral-900/60 backdrop-blur-sm p-8 sm:p-10 md:p-12 rounded-2xl ring-1 ring-white/10 hover:ring-white/30 transition-all duration-700 hover:shadow-[0_0_80px_rgba(255,255,255,0.1)] relative overflow-hidden animate-on-scroll">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-all duration-500">
                  <Shield className="h-8 w-8 text-black" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-500">Law Enforcement & Research Access</h2>
                <p className="text-neutral-200 text-lg leading-relaxed max-w-3xl mx-auto">
                  We provide free full access to our database for vetted researchers and law enforcement agencies investigating cybercrime, identity theft, and data breaches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className={`py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-neutral-900 to-neutral-950 relative overflow-hidden transition-all duration-1000 ${
        visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-100'
      }`}>
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10 px-4">
          <div className="text-white flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 md:mb-6 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-white hover:to-gray-400 transition-all duration-500 cursor-default animate-on-scroll">Start Monitoring Identities</h2>
            <p className="text-lg sm:text-xl text-neutral-200 mb-6 md:mb-8 max-w-2xl animate-on-scroll">
              Search exposures, enable monitoring, and access our API for research.
            </p>
            <Link href="/login">
              <Button 
                type="button"
                size="lg" 
                className="relative min-w-[200px] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-white text-black hover:bg-neutral-200 shadow-lg hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] transition-all duration-500 group overflow-hidden hover:scale-105 touch-manipulation animate-on-scroll"
              >
                <span className="relative z-10 flex items-center">
                  Access Dashboard
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-neutral-950 py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 group cursor-pointer">
            <Image src="/images/symbolwhite.png" alt="Obscura Labs" width={24} height={24} className="group-hover:scale-110 transition-transform duration-300" />
            <span className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">OBSCURA LABS</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-4 sm:mb-6">
            <Link 
              href="/privacy-policy" 
              className="text-neutral-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Privacy Policy
            </Link>
            <div className="hidden sm:block w-1 h-1 bg-neutral-500 rounded-full"></div>
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

