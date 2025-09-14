"use client"

import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Globe, FileText, CheckCircle, AlertTriangle, Key } from "lucide-react"
import Link from "next/link"

const complianceFrameworks = [
  {
    icon: <Shield className="h-8 w-8 text-white" />,
    title: "GDPR Compliance",
    description: "General Data Protection Regulation",
    details: [
      "Lawful basis for processing under legitimate interests",
      "Data minimization and purpose limitation",
      "Right to erasure requests handled within 30 days",
      "Data Protection Impact Assessments conducted regularly",
      "EU-US Data Privacy Framework certified"
    ]
  },
  {
    icon: <Globe className="h-8 w-8 text-white" />,
    title: "CCPA/CPRA",
    description: "California Consumer Privacy Act",
    details: [
      "Consumer rights requests processed within 45 days",
      "Opt-out mechanisms for data sales (we don't sell data)",
      "Annual privacy audits and assessments",
      "Transparent data collection practices",
      "Data retention policies aligned with requirements"
    ]
  },
  {
    icon: <Lock className="h-8 w-8 text-white" />,
    title: "SOC 2 Type II",
    description: "Security and Availability Controls",
    details: [
      "Annual third-party security audits",
      "Continuous monitoring of security controls",
      "Incident response procedures tested quarterly",
      "Access controls and authentication measures",
      "Data encryption at rest and in transit"
    ]
  },
  {
    icon: <FileText className="h-8 w-8 text-white" />,
    title: "ISO 27001",
    description: "Information Security Management",
    details: [
      "Risk-based approach to information security",
      "Regular security awareness training",
      "Documented security policies and procedures",
      "Continuous improvement processes",
      "Third-party certification pending"
    ]
  }
]

const dataProtection = [
  {
    title: "Encryption Standards",
    items: [
      "AES-256 encryption for data at rest",
      "TLS 1.3 for data in transit",
      "Hardware security modules for key management",
      "End-to-end encryption for sensitive operations"
    ]
  },
  {
    title: "Access Controls",
    items: [
      "Multi-factor authentication required",
      "Role-based access control (RBAC)",
      "Principle of least privilege",
      "Regular access reviews and audits"
    ]
  },
  {
    title: "Data Governance",
    items: [
      "Data classification and handling procedures",
      "Retention and deletion policies",
      "Data lineage and provenance tracking",
      "Cross-border data transfer agreements"
    ]
  },
  {
    title: "Incident Response",
    items: [
      "24/7 security operations center",
      "72-hour breach notification commitment",
      "Documented incident response plan",
      "Regular tabletop exercises"
    ]
  }
]

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Compliance & Security
          </h1>
          <p className="text-lg sm:text-xl text-neutral-200 max-w-3xl mx-auto">
            Obscura Labs maintains the highest standards of data protection, privacy compliance, 
            and security certifications to protect sensitive threat intelligence data.
          </p>
        </div>
      </section>

      {/* Compliance Frameworks */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Compliance Frameworks
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {complianceFrameworks.map((framework, index) => (
              <Card key={index} className="bg-neutral-900/60 border-white/10">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                      {framework.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">
                        {framework.title}
                      </CardTitle>
                      <CardDescription className="text-neutral-300">
                        {framework.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {framework.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-white/60 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-neutral-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection Measures */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Data Protection Measures
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dataProtection.map((category, index) => (
              <Card key={index} className="bg-neutral-900/60 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-neutral-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Audits */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <Card className="bg-neutral-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Certifications & Audits
              </CardTitle>
              <CardDescription className="text-neutral-300">
                Regular third-party assessments ensure our security posture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-neutral-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-2">Annual</div>
                  <p className="text-neutral-300">Security Audits</p>
                </div>
                <div className="text-center p-6 bg-neutral-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-2">Quarterly</div>
                  <p className="text-neutral-300">Penetration Testing</p>
                </div>
                <div className="text-center p-6 bg-neutral-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-2">Monthly</div>
                  <p className="text-neutral-300">Vulnerability Scanning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Data Processing */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-900/50">
        <div className="container mx-auto max-w-6xl">
          <Card className="bg-neutral-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Lawful Basis for Data Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Legitimate Interests</h3>
                <p className="text-neutral-300">
                  We process breach data under legitimate interests for cybersecurity defense and fraud prevention. 
                  This data is already public or semi-public due to criminal activity, and our processing helps 
                  protect individuals and organizations from harm.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Vital Interests</h3>
                <p className="text-neutral-300">
                  In cases where exposed data poses immediate risk to individuals' safety or financial security, 
                  we process data to protect vital interests of data subjects.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Legal Obligations</h3>
                <p className="text-neutral-300">
                  We cooperate with law enforcement agencies and comply with legal obligations to assist in 
                  cybercrime investigations and prevention.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact for Compliance */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-950">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-neutral-900 to-neutral-800 border-white/20">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Compliance Inquiries
              </h3>
              <p className="text-neutral-300 mb-6">
                For questions about our compliance programs, data protection measures, or to request 
                compliance documentation, please contact our compliance team.
              </p>
              <div className="space-y-2">
                <p className="text-white">
                  Email: <a href="mailto:compliance@obscuralabs.io" className="underline hover:text-neutral-300">
                    compliance@obscuralabs.io
                  </a>
                </p>
                <p className="text-white">
                  Data Protection Officer: <a href="mailto:dpo@obscuralabs.io" className="underline hover:text-neutral-300">
                    dpo@obscuralabs.io
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
