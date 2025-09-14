"use client"

import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, AlertTriangle, Mail, Clock, CheckCircle, XCircle, Bug } from "lucide-react"
import Link from "next/link"

const disclosureProcess = [
  {
    step: 1,
    title: "Discovery",
    description: "Identify a security vulnerability in our systems or services",
    icon: <Bug className="h-6 w-6 text-white" />
  },
  {
    step: 2,
    title: "Documentation",
    description: "Document the vulnerability with clear reproduction steps and potential impact",
    icon: <AlertTriangle className="h-6 w-6 text-white" />
  },
  {
    step: 3,
    title: "Report",
    description: "Send detailed report to security@obscuralabs.io with encrypted communication if needed",
    icon: <Mail className="h-6 w-6 text-white" />
  },
  {
    step: 4,
    title: "Acknowledgment",
    description: "We'll acknowledge receipt within 48 hours and provide a tracking number",
    icon: <Clock className="h-6 w-6 text-white" />
  },
  {
    step: 5,
    title: "Assessment",
    description: "Our security team will assess and validate the vulnerability",
    icon: <Shield className="h-6 w-6 text-white" />
  },
  {
    step: 6,
    title: "Resolution",
    description: "We'll work on a fix and keep you updated on progress",
    icon: <CheckCircle className="h-6 w-6 text-white" />
  }
]

const inScope = [
  "obscuralabs.io and all subdomains",
  "API endpoints (api.obscuralabs.io)",
  "Authentication and authorization mechanisms",
  "Data validation and sanitization",
  "Session management",
  "Cryptographic implementations",
  "Infrastructure security",
  "Third-party integrations affecting our security"
]

const outOfScope = [
  "Social engineering attacks",
  "Physical security issues",
  "Denial of Service (DoS) attacks",
  "Spam or social media interactions",
  "Issues in third-party services not under our control",
  "Previously reported vulnerabilities",
  "Vulnerabilities requiring destruction of data",
  "Issues found through automated scanning without validation"
]

const rewards = [
  { severity: "Critical", range: "$1,000 - $5,000", description: "RCE, authentication bypass, data exfiltration" },
  { severity: "High", range: "$500 - $1,000", description: "SQL injection, privilege escalation, XSS with impact" },
  { severity: "Medium", range: "$100 - $500", description: "CSRF, limited data exposure, logic flaws" },
  { severity: "Low", range: "$50 - $100", description: "Minor issues with limited impact" }
]

export default function ResponsibleDisclosurePage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Responsible Disclosure
          </h1>
          <p className="text-lg sm:text-xl text-neutral-200 max-w-3xl mx-auto">
            We take security seriously and appreciate the security research community's efforts 
            in helping us maintain the highest security standards.
          </p>
        </div>
      </section>

      {/* Disclosure Process */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Disclosure Process
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {disclosureProcess.map((item) => (
              <Card key={item.step} className="bg-neutral-900/60 border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-full">
                      <span className="text-lg font-bold text-white">{item.step}</span>
                    </div>
                    <div className="p-2 bg-white/10 rounded-lg">
                      {item.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-white mt-4">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-300">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Scope */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Program Scope
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-neutral-900/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  In Scope
                </CardTitle>
                <CardDescription className="text-neutral-300">
                  Vulnerabilities in these areas are eligible for rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {inScope.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-neutral-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-400" />
                  Out of Scope
                </CardTitle>
                <CardDescription className="text-neutral-300">
                  These issues are not eligible for rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {outOfScope.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-neutral-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Rewards */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Bug Bounty Rewards
          </h2>
          
          <Card className="bg-neutral-900/60 border-white/10">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-white font-semibold">Severity</th>
                      <th className="text-left p-4 text-white font-semibold">Reward Range</th>
                      <th className="text-left p-4 text-white font-semibold">Examples</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.map((reward, index) => (
                      <tr key={index} className="border-b border-white/5">
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded text-sm font-semibold ${
                            reward.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                            reward.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                            reward.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {reward.severity}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-300">{reward.range}</td>
                        <td className="p-4 text-neutral-300">{reward.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-400">
              * Reward amounts are determined based on impact, exploitability, and report quality
            </p>
          </div>
        </div>
      </section>

      {/* Guidelines */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-900/50">
        <div className="container mx-auto max-w-6xl">
          <Card className="bg-neutral-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Reporting Guidelines
              </CardTitle>
              <CardDescription className="text-neutral-300">
                Please follow these guidelines when reporting vulnerabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Do's</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Provide detailed reproduction steps</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Include proof-of-concept code when possible</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Allow us reasonable time to fix issues before disclosure</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Use encrypted communication for sensitive findings</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Don'ts</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Access or modify user data without permission</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Perform destructive testing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Use automated scanners that generate excessive traffic</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">Publicly disclose vulnerabilities before they're fixed</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Safe Harbor */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <Card className="bg-neutral-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Lock className="h-6 w-6" />
                Safe Harbor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-300 mb-4">
                When conducting vulnerability research according to this policy, we consider this research to be:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white/60 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-300">Authorized in accordance with the Computer Fraud and Abuse Act (CFAA)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white/60 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-300">Exempt from the Digital Millennium Copyright Act (DMCA)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white/60 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-300">Lawful under the General Data Protection Regulation (GDPR)</span>
                </li>
              </ul>
              <p className="text-neutral-300">
                We will not pursue civil action or initiate a complaint to law enforcement for accidental, 
                good faith violations of this policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-900/50">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-neutral-900 to-neutral-800 border-white/20">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Report a Vulnerability
              </h3>
              <p className="text-neutral-300 mb-6">
                Found a security issue? We appreciate your help in keeping Obscura Labs secure.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-white mb-2">
                    Email: <a href="mailto:security@obscuralabs.io" className="underline hover:text-neutral-300">
                      security@obscuralabs.io
                    </a>
                  </p>
                  <p className="text-sm text-neutral-400">
                    PGP Key available upon request for encrypted communication
                  </p>
                </div>
                <Button className="bg-white text-black hover:bg-neutral-200">
                  View PGP Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
