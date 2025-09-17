"use client"

import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Target, Users, Globe, Database, Zap, Lock, Eye, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const stats = [
  { number: "6.5B+", label: "Normalized Records", icon: <Database className="h-6 w-6" /> },
  { number: "500K+", label: "Daily New Entries", icon: <Zap className="h-6 w-6" /> },
  { number: "<1 min", label: "Alert Latency", icon: <Globe className="h-6 w-6" /> },
  { number: "24/7", label: "Monitoring", icon: <Eye className="h-6 w-6" /> },
]

const values = [
  {
    icon: <Shield className="h-8 w-8 text-white" />,
    title: "Security First",
    description: "We prioritize the security and privacy of all data, ensuring it's used exclusively for defensive purposes."
  },
  {
    icon: <Users className="h-8 w-8 text-white" />,
    title: "Vetted Access",
    description: "Access is limited to verified organizations, researchers, and law enforcement with legitimate security needs."
  },
  {
    icon: <Target className="h-8 w-8 text-white" />,
    title: "Actionable Intelligence",
    description: "We provide normalized, deduplicated data that security teams can immediately act upon."
  }
]

const whoWeServe = [
  {
    title: "Corporate Security Teams",
    description: "Enterprise organizations protecting employee and customer accounts from compromise",
    examples: ["Fortune 500 companies", "Financial institutions", "Healthcare organizations", "Technology companies"]
  },
  {
    title: "Security Researchers",
    description: "Academic and independent researchers studying cybercrime and breach trends",
    examples: ["Universities", "Security research labs", "Threat intelligence analysts", "Cybersecurity consultants"]
  },
  {
    title: "Law Enforcement",
    description: "Agencies investigating cybercrime, fraud, and identity theft cases",
    examples: ["Federal agencies", "State and local police", "International law enforcement", "Cybercrime units"]
  }
]

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              About Obscura Labs
            </h1>
            <p className="text-lg sm:text-xl text-neutral-200 max-w-3xl mx-auto">
              We combine large-scale data aggregation with advanced normalization to deliver actionable threat intelligence at scale.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl ring-1 ring-white/10 p-8 md:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-lg text-neutral-200 leading-relaxed">
              Obscura Labs provides identity exposure intelligence by aggregating and normalizing data from breaches, 
              ransomware leaks, and stealer logs. Our goal is to prevent account takeover, fraud, and identity theft 
              by giving vetted organizations and researchers access to real-time threat data.
            </p>
            <p className="text-lg text-neutral-200 leading-relaxed mt-4">
              We believe that defensive cybersecurity requires comprehensive visibility into exposed credentials and 
              session data. By making this intelligence accessible to those fighting cybercrime, we help protect 
              millions of individuals and organizations from identity-based attacks.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-neutral-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">What We Do</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-neutral-900/60 rounded-2xl p-8 ring-1 ring-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Data Collection & Aggregation</h3>
              <p className="text-neutral-200 mb-4">
                The platform continuously collects and analyzes compromised credentials, session cookies, 
                and device fingerprints from various sources including:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white/80 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-300">Database breaches and leaks</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white/80 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-300">Ransomware data exposures</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white/80 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-300">Stealer logs and malware infections</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white/80 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-300">Underground forums and marketplaces</span>
                </li>
              </ul>
            </div>

            <div className="bg-neutral-900/60 rounded-2xl p-8 ring-1 ring-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Intelligence Processing</h3>
              <p className="text-neutral-200 mb-4">
                This data is searchable, monitorable, and exportable for security teams, law enforcement, 
                and researchers investigating cybercrime. Our processing includes:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white/80 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-300">Advanced normalization and deduplication</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white/80 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-300">Real-time monitoring and alerting</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white/80 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-300">API access for bulk analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white/80 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-300">Historical trend analysis</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-neutral-900/60 border-white/10 text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3 text-white/80">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-neutral-300">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">Who We Serve</h2>
          
          <p className="text-lg text-neutral-200 text-center mb-12 max-w-3xl mx-auto">
            Clients include corporate security teams, investigators, researchers, and law enforcement agencies. 
            Access is limited to defensive cybersecurity and investigative purposes only.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whoWeServe.map((segment, index) => (
              <Card key={index} className="bg-neutral-900/60 border-white/10 hover:border-white/20 transition-all duration-300">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-white mb-3">{segment.title}</h3>
                  <p className="text-neutral-300 mb-6">{segment.description}</p>
                  <div className="space-y-2">
                    {segment.examples.map((example, exIndex) => (
                      <div key={exIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-neutral-400">{example}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-neutral-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/10 rounded-xl">
                    {value.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-neutral-300">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Protect Your Organization?
          </h2>
          <p className="text-lg text-neutral-200 mb-8">
            Join the fight against identity-based attacks with Obscura Labs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-neutral-200 px-8"
              onClick={() => router.push('/login')}
            >
              Try Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8"
              onClick={() => router.push('/contact')}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
