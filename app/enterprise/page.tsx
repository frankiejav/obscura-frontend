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
      {icon === "people" && (
        <path d="M13.69 10.43c-.79-.49-1.97-.97-3.41-1.32.7-.51 1.2-1.36 1.34-2.35.02-.1.03-.21.03-.32v-.38a2.34 2.34 0 0 0-.2-.95 2.02 2.02 0 0 0-.56-.75 2.49 2.49 0 0 0-.85-.49A3.02 3.02 0 0 0 9 4a3.02 3.02 0 0 0-1.04.17c-.32.1-.61.27-.85.49-.24.22-.43.47-.56.75-.13.29-.2.61-.2.95v.38c0 .11.01.21.03.32.14.99.64 1.84 1.34 2.35-1.44.35-2.62.83-3.41 1.32C3.49 11 3 11.67 3 12.4c0 .53.31.99.75 1.21.47.23 1.02.39 1.61.39h5.28c.59 0 1.14-.16 1.61-.39.44-.22.75-.68.75-1.21 0-.73-.49-1.4-1.31-1.97z" fillRule="evenodd" />
      )}
      {icon === "globe-network" && (
        <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" fillRule="evenodd" />
      )}
      {icon === "cog" && (
        <path d="M15.19 6.39h-1.85c-.11-.37-.27-.71-.45-1.04l1.36-1.36c.31-.31.31-.82 0-1.13l-1.13-1.13a.803.803 0 0 0-1.13 0l-1.36 1.36c-.33-.17-.67-.33-1.04-.44V.8c0-.44-.36-.8-.8-.8H7.21c-.44 0-.8.36-.8.8v1.85c-.37.11-.71.27-1.04.44L4.01 1.73a.803.803 0 0 0-1.13 0L1.75 2.86c-.31.31-.31.82 0 1.13l1.36 1.36c-.17.33-.33.67-.44 1.04H.82c-.45 0-.81.36-.81.8v1.58c0 .44.36.8.8.8h1.85c.11.37.27.71.44 1.04l-1.36 1.36c-.31.31-.31.82 0 1.13l1.13 1.13c.31.31.82.31 1.13 0l1.36-1.36c.33.18.67.33 1.04.44v1.85c0 .44.36.8.8.8h1.58c.44 0 .8-.36.8-.8v-1.85c.37-.11.71-.27 1.04-.44l1.36 1.36c.31.31.82.31 1.13 0l1.13-1.13c.31-.31.31-.82 0-1.13l-1.36-1.36c.18-.33.33-.67.44-1.04h1.85c.44 0 .8-.36.8-.8V7.19c.01-.44-.35-.8-.79-.8zM8 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fillRule="evenodd" />
      )}
      {icon === "tick" && (
        <path d="M14 3c-.28 0-.53.11-.71.29L6 10.59l-3.29-3.3a1.003 1.003 0 0 0-1.42 1.42l4 4c.18.18.43.29.71.29s.53-.11.71-.29l8-8A1.003 1.003 0 0 0 14 3z" fillRule="evenodd" />
      )}
      {icon === "arrow-top-right" && (
        <path d="M5 3h8v8l-1-1V4.41L4.41 12l-.7-.71L11.29 4H6L5 3z" fillRule="evenodd" />
      )}
      {icon === "headset" && (
        <path d="M8 0C4.69 0 2 2.69 2 6v4c0 1.1.9 2 2 2h1V7H3V6c0-2.76 2.24-5 5-5s5 2.24 5 5v1h-2v5h1c1.1 0 2-.9 2-2V6c0-3.31-2.69-6-6-6z" fillRule="evenodd" />
      )}
      {icon === "diagram-tree" && (
        <path d="M15 12H9v-2h2V7H9V5h2V2H7v3H5V2H1v3h2v2H1v3h2v2h4v2H1v3h4v-3h2v3h4v-3H9v-2h6v-3z" fillRule="evenodd" />
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

const features = [
  {
    icon: "shield",
    title: "Advanced Threat Protection",
    description: "Real-time monitoring and alerting for exposed credentials across your entire organization."
  },
  {
    icon: "people",
    title: "Unlimited Team Members",
    description: "Add your entire security team with role-based access controls and audit logging."
  },
  {
    icon: "diagram-tree",
    title: "API Integration",
    description: "Unlimited API access for seamless integration with your existing security infrastructure."
  },
  {
    icon: "cog",
    title: "Custom Workflows",
    description: "Build automated response workflows with webhooks and custom integrations."
  },
  {
    icon: "headset",
    title: "Dedicated Support",
    description: "24/7 priority support with dedicated customer success manager."
  },
  {
    icon: "globe-network",
    title: "Global Coverage",
    description: "Monitor identities across all regions with localized data processing."
  }
]

const benefits = [
  "Unlimited credential monitoring",
  "Custom data retention policies",
  "SSO/SAML integration",
  "Dedicated infrastructure option",
  "Custom SLA agreements",
  "Compliance reports (SOC 2, ISO 27001)",
  "Training and onboarding",
  "Quarterly business reviews"
]

export default function EnterprisePage() {
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
              ENTERPRISE
            </motion.p>
            <motion.h1 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[32px] sm:text-[40px] lg:text-[52px] font-light text-[#1c1c1c] leading-[1.08] tracking-[-0.03em] mb-6 max-w-4xl"
            >
              Enterprise-grade identity threat intelligence
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[#5a5a5a] text-base sm:text-lg max-w-2xl mb-8"
            >
              Protect your organization at scale with advanced features, dedicated support, and custom integrations tailored to your security needs.
            </motion.p>
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pltr-btn-primary px-8 py-3 inline-flex items-center gap-2"
                >
                  Contact Sales
                  <BlueprintIcon icon="arrow-top-right" size={14} />
                </motion.button>
              </Link>
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pltr-btn-secondary px-8 py-3"
                >
                  View Pricing
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
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
            <p className="pltr-label mb-5">FEATURES</p>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[38px] font-light text-[#f1f3f5] leading-[1.12] tracking-[-0.02em]">
              Built for enterprise security teams
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#2a2a2a] rounded-lg overflow-hidden">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.06, ease: [0.25, 0.4, 0.25, 1] }}
                className="bg-[#1c1c1c] p-6 sm:p-8 lg:p-10 group hover:bg-[#222] transition-colors duration-300"
              >
                <BlueprintIcon icon={feature.icon} size={20} className="text-[#5a5a5a] mb-5 group-hover:text-[#e07a4a] transition-colors duration-300" />
                <h3 className="text-base sm:text-lg font-medium text-[#f1f3f5] mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-[#868e96] text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pltr-section py-20 sm:py-24 lg:py-32 px-6 lg:px-8 bg-[#ffffff] pltr-grain">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <p className="pltr-label mb-5">INCLUDED</p>
              <h2 className="text-[26px] sm:text-[32px] lg:text-[40px] font-light text-[#1c1c1c] leading-[1.12] tracking-[-0.02em] mb-6">
                Everything you need to protect your organization
              </h2>
              <p className="text-[#5a5a5a] text-base sm:text-lg leading-relaxed">
                Our enterprise plan includes all features plus dedicated resources and custom configurations for your specific requirements.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
              className="bg-[#f7f6f3] rounded-lg p-8 lg:p-10"
            >
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <BlueprintIcon icon="tick" size={16} className="text-[#e07a4a] mt-0.5 flex-shrink-0" />
                    <span className="text-[#1c1c1c] text-sm">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
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
            <p className="pltr-label mb-5">GET STARTED</p>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[44px] font-light text-[#1c1c1c] leading-[1.1] tracking-[-0.02em] mb-8 max-w-2xl mx-auto">
              Ready to secure your enterprise?
            </h2>
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pltr-btn-primary px-8 py-3 w-full sm:w-auto inline-flex items-center justify-center gap-2"
                >
                  Schedule a Demo
                  <BlueprintIcon icon="arrow-top-right" size={14} />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
