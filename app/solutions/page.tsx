"use client"

import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Search, AlertTriangle, Lock, Database, Target, Bell, ArrowRight, Briefcase, Building, GraduationCap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const solutions = [
  {
    id: "corporate",
    icon: <Building className="h-12 w-12 text-white" />,
    title: "Corporate Security Teams",
    description: "Protect your organization from account takeover and data breaches",
    features: [
      {
        icon: <Shield className="h-5 w-5 text-white/80" />,
        title: "Prevent Account Takeover",
        description: "Monitor employee credentials for exposure in breaches and stealer logs. Receive instant alerts when corporate emails or passwords are compromised."
      },
      {
        icon: <Bell className="h-5 w-5 text-white/80" />,
        title: "Employee Credential Monitoring",
        description: "Continuously monitor your corporate domain for exposed credentials. Track password reuse and identify high-risk accounts before attackers exploit them."
      },
      {
        icon: <Lock className="h-5 w-5 text-white/80" />,
        title: "Session Hijacking Prevention",
        description: "Detect stolen authentication cookies and session tokens from compromised devices. Proactively invalidate exposed sessions to prevent unauthorized access."
      },
      {
        icon: <Database className="h-5 w-5 text-white/80" />,
        title: "Vendor & Supply Chain Risk",
        description: "Monitor third-party vendor domains and partner organizations for credential exposures that could impact your security posture."
      }
    ],
    benefits: [
      "Reduce account takeover incidents by 70%",
      "Get alerts within minutes of new exposures",
      "Integrate with your SIEM and security tools via API",
      "Export data for compliance reporting and audits"
    ],
    cta: "Start Protecting Your Organization"
  },
  {
    id: "researchers",
    icon: <GraduationCap className="h-12 w-12 text-white" />,
    title: "Security Researchers",
    description: "Access comprehensive threat intelligence data for analysis and research",
    features: [
      {
        icon: <Search className="h-5 w-5 text-white/80" />,
        title: "Data Enrichment",
        description: "Access normalized breach data across millions of records. Enrich your research with comprehensive credential and session intelligence."
      },
      {
        icon: <Database className="h-5 w-5 text-white/80" />,
        title: "Breach Analysis",
        description: "Analyze breach patterns, password trends, and attack methodologies. Track the evolution of cybercrime tactics and data exposure trends."
      },
      {
        icon: <Target className="h-5 w-5 text-white/80" />,
        title: "Intelligence Methodology",
        description: "Leverage our normalized data for threat hunting and attribution. Identify connections between breaches and track threat actor campaigns."
      },
      {
        icon: <AlertTriangle className="h-5 w-5 text-white/80" />,
        title: "Academic Research",
        description: "Free access for accredited academic institutions. Use our data for cybersecurity research, publications, and education."
      }
    ],
    benefits: [
      "Free access for verified researchers",
      "API access for bulk data analysis",
      "Historical breach data dating back years",
      "Normalized and deduplicated datasets"
    ],
    cta: "Apply for Research Access"
  },
  {
    id: "law-enforcement",
    icon: <Shield className="h-12 w-12 text-white" />,
    title: "Law Enforcement",
    description: "Support cybercrime investigations with comprehensive identity intelligence",
    features: [
      {
        icon: <Search className="h-5 w-5 text-white/80" />,
        title: "Cybercrime Investigation",
        description: "Access breach data to support investigations into account takeover, fraud, and identity theft cases. Track stolen credentials back to specific breaches."
      },
      {
        icon: <Users className="h-5 w-5 text-white/80" />,
        title: "Identity Theft Cases",
        description: "Identify when victim identities appear in breach data. Provide evidence for prosecution and help victims understand the scope of exposure."
      },
      {
        icon: <AlertTriangle className="h-5 w-5 text-white/80" />,
        title: "Ransomware Incident Response",
        description: "Access data from ransomware leaks to support incident response. Identify affected organizations and individuals from leaked data."
      },
      {
        icon: <Briefcase className="h-5 w-5 text-white/80" />,
        title: "Evidence Collection",
        description: "Export breach data in court-admissible formats. Maintain chain of custody with detailed audit logs and timestamps."
      }
    ],
    benefits: [
      "Free access for verified law enforcement",
      "24/7 support for urgent investigations",
      "Bulk export capabilities for case files",
      "Expert testimony and technical support available"
    ],
    cta: "Request Law Enforcement Access"
  }
]

export default function SolutionsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Solutions for Every Security Need
          </h1>
          <p className="text-lg sm:text-xl text-neutral-200 max-w-3xl mx-auto">
            Whether you're protecting an enterprise, conducting research, or investigating cybercrime, 
            Obscura Labs provides the identity intelligence you need.
          </p>
        </div>
      </section>

      {/* Solutions Sections */}
      {solutions.map((solution, index) => (
        <section 
          key={solution.id}
          className={`py-16 sm:py-20 px-4 sm:px-6 ${
            index % 2 === 0 ? 'bg-neutral-950' : 'bg-neutral-900/50'
          }`}
        >
          <div className="container mx-auto max-w-6xl">
            {/* Solution Header */}
            <div className="flex flex-col items-center text-center mb-12">
              <div className="p-4 bg-white/10 rounded-2xl mb-6">
                {solution.icon}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {solution.title}
              </h2>
              <p className="text-lg text-neutral-200 max-w-2xl">
                {solution.description}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {solution.features.map((feature, featureIndex) => (
                <Card 
                  key={featureIndex}
                  className="bg-neutral-900/60 border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white/10 rounded-lg">
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">
                          {feature.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Benefits Section */}
            <div className="bg-neutral-900/60 rounded-2xl p-8 ring-1 ring-white/10">
              <h3 className="text-xl font-semibold text-white mb-6">Key Benefits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {solution.benefits.map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0" />
                    <span className="text-neutral-200">{benefit}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA Button */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-neutral-200 transition-all duration-300 group"
                  onClick={() => {
                    if (solution.id === "law-enforcement" || solution.id === "researchers") {
                      router.push('/contact')
                    } else {
                      router.push('/login')
                    }
                  }}
                >
                  {solution.cta}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-neutral-200 mb-8">
            Join thousands of organizations using Obscura Labs to protect against identity threats.
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
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
