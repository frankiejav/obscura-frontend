"use client"

import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { motion } from "motion/react"
import Link from "next/link"

function BlueprintIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      {icon === "shield" && (
        <path d="M8 0l7 3v4c0 3.53-2.61 6.74-7 8-4.39-1.26-7-4.47-7-8V3l7-3zm0 1.11L2 3.72V7c0 2.89 2.2 5.55 6 6.72 3.8-1.17 6-3.83 6-6.72V3.72L8 1.11z" fillRule="evenodd" />
      )}
      {icon === "lock" && (
        <path d="M12.5 7H12V4c0-2.21-1.79-4-4-4S4 1.79 4 4v3h-.5C2.67 7 2 7.67 2 8.5v6c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zM5 4c0-1.65 1.35-3 3-3s3 1.35 3 3v3H5V4zm5 8H6v-2h4v2z" fillRule="evenodd" />
      )}
      {icon === "globe" && (
        <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm5.86 5h-2.2c-.24-1.15-.62-2.19-1.11-3.03A6.03 6.03 0 0 1 13.86 5zM8 1c.62 0 1.39 1.13 1.86 3H6.14C6.61 2.13 7.38 1 8 1zm-5.86 4c.56-1.32 1.48-2.44 2.65-3.19-.49.87-.87 1.94-1.11 3.19h-1.54zM2 8c0-.34.03-.67.08-1h2.08c-.05.33-.08.66-.08 1s.03.67.08 1H2.08c-.05-.33-.08-.66-.08-1zm.14 2h1.54c.24 1.25.62 2.32 1.11 3.19A5.99 5.99 0 0 1 2.14 10zm1.72 0h3.06c-.14.98-.37 1.87-.68 2.63-.16.38-.33.71-.52.98C4.75 12.78 4.08 11.53 3.86 10zm4.14 5c-.62 0-1.39-1.13-1.86-3h3.72c-.47 1.87-1.24 3-1.86 3zm1.28-.39c-.19-.27-.36-.6-.52-.98-.31-.76-.54-1.65-.68-2.63h3.06c-.22 1.53-.89 2.78-1.86 3.61zm2.51-2.42A5.99 5.99 0 0 0 13.86 10h-1.54c-.24 1.25-.62 2.32-1.11 3.19zM11.84 9H8.92c.05-.33.08-.66.08-1s-.03-.67-.08-1h2.92c.05.33.08.66.08 1s-.03.67-.08 1zm.3-3H8.92c.14-.98.37-1.87.68-2.63.16-.38.33-.71.52-.98.97.83 1.64 2.08 1.86 3.61z" fillRule="evenodd" />
      )}
      {icon === "document" && (
        <path d="M9 0H3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V5L9 0zm3 14H4V2h4v4h4v8zM8 5V1l4 4H8z" fillRule="evenodd" />
      )}
      {icon === "tick" && (
        <path d="M14 3c-.28 0-.53.11-.71.29L6 10.59l-3.29-3.3a1.003 1.003 0 0 0-1.42 1.42l4 4c.18.18.43.29.71.29s.53-.11.71-.29l8-8A1.003 1.003 0 0 0 14 3z" fillRule="evenodd" />
      )}
      {icon === "key" && (
        <path d="M11 0a5 5 0 0 0-4.916 5.916L0 12v3a1 1 0 0 0 1 1h1v-2h2v-2h2v-2h2.084A5 5 0 1 0 11 0zm1 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fillRule="evenodd" />
      )}
      {icon === "warning" && (
        <path d="M15.84 13.5l.01-.01-7-12-.01.01c-.17-.3-.48-.5-.84-.5s-.67.2-.84.5l-.01-.01-7 12 .01.01c-.1.15-.16.31-.16.5 0 .55.45 1 1 1h14c.55 0 1-.45 1-1 0-.19-.06-.35-.16-.5zM8 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-3H7V6h2v4z" fillRule="evenodd" />
      )}
      {icon === "arrow-top-right" && (
        <path d="M5 3h8v8l-1-1V4.41L4.41 12l-.7-.71L11.29 4H6L5 3z" fillRule="evenodd" />
      )}
    </svg>
  )
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const complianceFrameworks = [
  {
    icon: "shield",
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
    icon: "globe",
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
    icon: "lock",
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
    icon: "document",
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
    <div className="min-h-screen bg-[#f7f6f3]">
      <Header />

      <section className="relative pt-32 pb-20 sm:pb-24 lg:pb-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="pltr-label mb-5"
            >
              COMPLIANCE
            </motion.p>
            <motion.h1 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[32px] sm:text-[40px] lg:text-[52px] font-light text-[#1c1c1c] leading-[1.08] tracking-[-0.03em] mb-5 max-w-4xl"
            >
              Compliance & Security
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[#5a5a5a] text-base sm:text-lg max-w-2xl"
            >
              We maintain the highest standards of data protection, privacy compliance, and security certifications to protect sensitive threat intelligence data.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="pltr-section py-20 sm:py-24 lg:py-32 px-6 lg:px-8 bg-[#ffffff] pltr-grain">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="mb-12 sm:mb-16"
          >
            <p className="pltr-label mb-5">FRAMEWORKS</p>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[40px] font-light text-[#1c1c1c] leading-[1.12] tracking-[-0.02em]">
              Compliance Frameworks
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#dee2e6] rounded-lg overflow-hidden">
            {complianceFrameworks.map((framework, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
                className="bg-[#ffffff] p-8 lg:p-10"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-[#f7f6f3] rounded-lg">
                    <BlueprintIcon icon={framework.icon} size={20} className="text-[#e07a4a]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#1c1c1c]">{framework.title}</h3>
                    <p className="text-[#868e96] text-sm">{framework.description}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {framework.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-3">
                      <BlueprintIcon icon="tick" size={14} className="text-[#e07a4a] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[#5a5a5a]">{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pltr-section py-20 sm:py-24 lg:py-32 px-6 lg:px-8 bg-[#f7f6f3]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="mb-12 sm:mb-16"
          >
            <p className="pltr-label mb-5">PROTECTION</p>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[40px] font-light text-[#1c1c1c] leading-[1.12] tracking-[-0.02em]">
              Data Protection Measures
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#dee2e6] rounded-lg overflow-hidden">
            {dataProtection.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
                className="bg-[#ffffff] p-8 lg:p-10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <BlueprintIcon icon="key" size={18} className="text-[#e07a4a]" />
                  <h3 className="text-lg font-medium text-[#1c1c1c]">{category.title}</h3>
                </div>
                <ul className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-[#adb5bd] rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-[#5a5a5a]">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pltr-section pltr-section-dark py-20 sm:py-24 lg:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="mb-12 sm:mb-16"
          >
            <p className="pltr-label mb-5">AUDITS</p>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[38px] font-light text-[#f1f3f5] leading-[1.12] tracking-[-0.02em]">
              Certifications & Audits
            </h2>
            <p className="text-[#868e96] text-base sm:text-lg mt-4">
              Regular third-party assessments ensure our security posture
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#2a2a2a] rounded-lg overflow-hidden">
            {[
              { value: "Annual", label: "Security Audits" },
              { value: "Quarterly", label: "Penetration Testing" },
              { value: "Monthly", label: "Vulnerability Scanning" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
                className="bg-[#1c1c1c] p-8 lg:p-10 text-center"
              >
                <div className="text-[28px] lg:text-[34px] font-light text-[#f1f3f5] mb-2 font-mono tracking-tight">{item.value}</div>
                <div className="text-[#868e96] text-sm">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pltr-section py-20 sm:py-24 lg:py-32 px-6 lg:px-8 bg-[#ffffff] pltr-grain">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="border border-[#e9ecef] rounded-lg p-8 lg:p-12"
          >
            <h2 className="text-[24px] sm:text-[28px] font-light text-[#1c1c1c] mb-4">
              Lawful Basis for Data Processing
            </h2>
            
            <div className="space-y-8 mt-8">
              <div>
                <h3 className="text-base font-medium text-[#1c1c1c] mb-3">Legitimate Interests</h3>
                <p className="text-[#5a5a5a] text-sm leading-relaxed">
                  We process breach data under legitimate interests for cybersecurity defense and fraud prevention. 
                  This data is already public or semi-public due to criminal activity, and our processing helps 
                  protect individuals and organizations from harm.
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-medium text-[#1c1c1c] mb-3">Vital Interests</h3>
                <p className="text-[#5a5a5a] text-sm leading-relaxed">
                  In cases where exposed data poses immediate risk to individuals' safety or financial security, 
                  we process data to protect vital interests of data subjects.
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-[#1c1c1c] mb-3">Legal Obligations</h3>
                <p className="text-[#5a5a5a] text-sm leading-relaxed">
                  We cooperate with law enforcement agencies and comply with legal obligations to assist in 
                  cybercrime investigations and prevention.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pltr-section py-24 sm:py-32 lg:py-40 bg-[#f7f6f3] px-6 lg:px-8 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] bg-[#e07a4a]/[0.04] rounded-full blur-3xl" />
        </motion.div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <BlueprintIcon icon="warning" size={32} className="text-[#e07a4a] mx-auto mb-6" />
            <h2 className="text-[26px] sm:text-[32px] lg:text-[44px] font-light text-[#1c1c1c] leading-[1.1] tracking-[-0.02em] mb-6 max-w-2xl mx-auto">
              Compliance Inquiries
            </h2>
            <p className="text-[#5a5a5a] text-base sm:text-lg max-w-xl mx-auto mb-8">
              For questions about our compliance programs, data protection measures, or to request compliance documentation, please contact our team.
            </p>
            <div className="space-y-2 text-[#1c1c1c]">
              <p>
                Email: <a href="mailto:compliance@obscuralabs.io" className="text-[#e07a4a] hover:underline">
                  compliance@obscuralabs.io
                </a>
              </p>
              <p>
                Data Protection Officer: <a href="mailto:dpo@obscuralabs.io" className="text-[#e07a4a] hover:underline">
                  dpo@obscuralabs.io
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
