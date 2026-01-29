"use client"

import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { motion } from "motion/react"
import Link from "next/link"

function BlueprintIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      {icon === "eye-open" && (
        <path d="M8 3C4.51 3 1.63 5.36.15 8c1.48 2.64 4.36 5 7.85 5s6.37-2.36 7.85-5c-1.48-2.64-4.36-5-7.85-5zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fillRule="evenodd" />
      )}
      {icon === "notifications" && (
        <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm6-5c-.55 0-1-.45-1-1V6c0-2.43-1.73-4.45-4.02-4.9v-.6a1 1 0 0 0-2 0v.61C4.73 1.55 3 3.57 3 6v4c0 .55-.45 1-1 1s-1 .45-1 1 .45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z" fillRule="evenodd" />
      )}
      {icon === "pulse" && (
        <path d="M16 8c0 .55-.45 1-1 1h-2.17l-1.86 4.65c-.09.23-.27.35-.47.35s-.39-.12-.47-.35L6.97 5.74 5.5 9H1c-.55 0-1-.45-1-1s.45-1 1-1h3.17l1.36-3.65c.09-.23.27-.35.47-.35s.39.12.47.35l3.06 7.91L10.5 9H15c.55 0 1 .45 1 1z" fillRule="evenodd" />
      )}
      {icon === "globe" && (
        <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" fillRule="evenodd" />
      )}
      {icon === "tick" && (
        <path d="M14 3c-.28 0-.53.11-.71.29L6 10.59l-3.29-3.3a1.003 1.003 0 0 0-1.42 1.42l4 4c.18.18.43.29.71.29s.53-.11.71-.29l8-8A1.003 1.003 0 0 0 14 3z" fillRule="evenodd" />
      )}
      {icon === "arrow-top-right" && (
        <path d="M5 3h8v8l-1-1V4.41L4.41 12l-.7-.71L11.29 4H6L5 3z" fillRule="evenodd" />
      )}
      {icon === "envelope" && (
        <path d="M0 3v10h16V3H0zm14.5 1.5L8 8.25 1.5 4.5h13zM1.5 11.5v-6L8 9.75l6.5-4.25v6h-13z" fillRule="evenodd" />
      )}
      {icon === "user" && (
        <path d="M8 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm6 10H2c-.55 0-1-.45-1-1 0-2.76 2.24-5 5-5h4c2.76 0 5 2.24 5 5 0 .55-.45 1-1 1z" fillRule="evenodd" />
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

const monitoringTypes = [
  {
    icon: "envelope",
    title: "Email Monitoring",
    description: "Monitor corporate email addresses and personal accounts for credential exposures."
  },
  {
    icon: "globe",
    title: "Domain Monitoring",
    description: "Track all credentials associated with your organization's domains."
  },
  {
    icon: "user",
    title: "Executive Monitoring",
    description: "VIP protection for executives and high-value targets with enhanced alerting."
  }
]

const features = [
  "Real-time exposure alerts",
  "Configurable notification channels",
  "Webhook integrations",
  "Historical breach tracking",
  "Risk scoring and prioritization",
  "Automated remediation workflows",
  "API access for integration",
  "Custom reporting and analytics"
]

const alertChannels = [
  { name: "Email Alerts", description: "Instant email notifications" },
  { name: "Slack Integration", description: "Post alerts to your channels" },
  { name: "Webhook Delivery", description: "Custom endpoint delivery" },
  { name: "API Polling", description: "Query for new exposures" }
]

export default function MonitoringPage() {
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
              IDENTITY MONITORING
            </motion.p>
            <motion.h1 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[32px] sm:text-[40px] lg:text-[52px] font-light text-[#1c1c1c] leading-[1.08] tracking-[-0.03em] mb-6 max-w-4xl"
            >
              Continuous monitoring for credential exposures
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[#5a5a5a] text-base sm:text-lg max-w-2xl mb-8"
            >
              Set up monitoring for your domains, email addresses, and key personnel to receive instant alerts when credentials are exposed.
            </motion.p>
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pltr-btn-primary px-8 py-3 inline-flex items-center gap-2"
                >
                  Start Monitoring
                  <BlueprintIcon icon="eye-open" size={14} />
                </motion.button>
              </Link>
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pltr-btn-secondary px-8 py-3"
                >
                  View Plans
                </motion.button>
              </Link>
            </motion.div>
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
            <p className="pltr-label mb-5">MONITORING TYPES</p>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[40px] font-light text-[#1c1c1c] leading-[1.12] tracking-[-0.02em]">
              What you can monitor
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#dee2e6] rounded-lg overflow-hidden">
            {monitoringTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
                className="bg-[#ffffff] p-8 lg:p-10"
              >
                <BlueprintIcon icon={type.icon} size={24} className="text-[#e07a4a] mb-5" />
                <h3 className="text-lg font-medium text-[#1c1c1c] mb-3">{type.title}</h3>
                <p className="text-[#5a5a5a] text-sm leading-relaxed">{type.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pltr-section pltr-section-dark py-20 sm:py-24 lg:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <p className="pltr-label mb-5">FEATURES</p>
              <h2 className="text-[26px] sm:text-[32px] lg:text-[38px] font-light text-[#f1f3f5] leading-[1.12] tracking-[-0.02em] mb-6">
                Powerful monitoring capabilities
              </h2>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <BlueprintIcon icon="tick" size={14} className="text-[#e07a4a] flex-shrink-0" />
                    <span className="text-[#f1f3f5] text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <p className="pltr-label mb-5">ALERT CHANNELS</p>
              <h3 className="text-xl font-light text-[#f1f3f5] mb-6">Get notified your way</h3>
              <div className="space-y-4">
                {alertChannels.map((channel, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
                    className="p-5 bg-[#222] rounded-lg border border-[#2a2a2a]"
                  >
                    <h4 className="text-[#f1f3f5] font-medium mb-1">{channel.name}</h4>
                    <p className="text-[#868e96] text-sm">{channel.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
            className="text-center"
          >
            <BlueprintIcon icon="pulse" size={32} className="text-[#e07a4a] mx-auto mb-6" />
            <h2 className="text-[26px] sm:text-[32px] lg:text-[44px] font-light text-[#1c1c1c] leading-[1.1] tracking-[-0.02em] mb-8 max-w-2xl mx-auto">
              Start monitoring in minutes
            </h2>
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pltr-btn-primary px-8 py-3 w-full sm:w-auto inline-flex items-center justify-center gap-2"
                >
                  Get Started
                  <BlueprintIcon icon="arrow-top-right" size={14} />
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pltr-btn-secondary px-8 py-3 w-full sm:w-auto"
                >
                  Contact Sales
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
