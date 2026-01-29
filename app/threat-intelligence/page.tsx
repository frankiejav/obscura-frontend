"use client"

import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { motion } from "motion/react"
import Link from "next/link"

function BlueprintIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      {icon === "search" && (
        <path d="M10.68 11.39a6 6 0 1 1 .71-.71l4.27 4.27-.71.7-4.27-4.26zM6 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fillRule="evenodd" />
      )}
      {icon === "database" && (
        <path d="M2 3.5C2 1.57 4.69 0 8 0s6 1.57 6 3.5V5c0 1.93-2.69 3.5-6 3.5S2 6.93 2 5V3.5zm0 4.35V11c0 1.93 2.69 3.5 6 3.5s6-1.57 6-3.5V7.85c-1.33 1.04-3.53 1.65-6 1.65s-4.67-.61-6-1.65z" fillRule="evenodd" />
      )}
      {icon === "warning-sign" && (
        <path d="M15.84 13.5l.01-.01-7-12-.01.01c-.17-.3-.48-.5-.84-.5s-.67.2-.84.5l-.01-.01-7 12 .01.01c-.1.15-.16.31-.16.5 0 .55.45 1 1 1h14c.55 0 1-.45 1-1 0-.19-.06-.35-.16-.5zM8 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-3H7V6h2v4z" fillRule="evenodd" />
      )}
      {icon === "timeline-events" && (
        <path d="M8 4c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1S7 .45 7 1v2c0 .55.45 1 1 1zm0 2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1V7c0-.55-.45-1-1-1zm0 6c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1zM3 6H1c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1zm12 0h-2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1z" fillRule="evenodd" />
      )}
      {icon === "tick" && (
        <path d="M14 3c-.28 0-.53.11-.71.29L6 10.59l-3.29-3.3a1.003 1.003 0 0 0-1.42 1.42l4 4c.18.18.43.29.71.29s.53-.11.71-.29l8-8A1.003 1.003 0 0 0 14 3z" fillRule="evenodd" />
      )}
      {icon === "arrow-top-right" && (
        <path d="M5 3h8v8l-1-1V4.41L4.41 12l-.7-.71L11.29 4H6L5 3z" fillRule="evenodd" />
      )}
      {icon === "shield" && (
        <path d="M8 0l7 3v4c0 3.53-2.61 6.74-7 8-4.39-1.26-7-4.47-7-8V3l7-3zm0 1.11L2 3.72V7c0 2.89 2.2 5.55 6 6.72 3.8-1.17 6-3.83 6-6.72V3.72L8 1.11z" fillRule="evenodd" />
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

const dataSources = [
  {
    title: "Infostealer Logs",
    description: "RedLine, LummaC2, Raccoon, Vidar, and other malware families",
    count: "4.2B+ records"
  },
  {
    title: "Ransomware Leaks",
    description: "Data from ransomware group leak sites and extortion campaigns",
    count: "850M+ records"
  },
  {
    title: "Database Breaches",
    description: "Credential dumps from breached services and platforms",
    count: "1.2B+ records"
  },
  {
    title: "Underground Forums",
    description: "Threat actor marketplaces and hacking forums",
    count: "200M+ records"
  }
]

const capabilities = [
  "Real-time credential exposure alerts",
  "Session token and cookie detection",
  "Malware family attribution",
  "Victim device fingerprinting",
  "Geographic infection mapping",
  "Historical breach correlation",
  "API integration for automation",
  "Custom alerting workflows"
]

export default function ThreatIntelligencePage() {
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
              THREAT INTELLIGENCE
            </motion.p>
            <motion.h1 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[32px] sm:text-[40px] lg:text-[52px] font-light text-[#1c1c1c] leading-[1.08] tracking-[-0.03em] mb-6 max-w-4xl"
            >
              Identity exposure intelligence from the underground
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[#5a5a5a] text-base sm:text-lg max-w-2xl mb-8"
            >
              We aggregate and normalize data from infostealers, ransomware leaks, and underground forums to provide comprehensive threat intelligence.
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
                  Start Searching
                  <BlueprintIcon icon="search" size={14} />
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pltr-btn-secondary px-8 py-3"
                >
                  Request Demo
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
            <p className="pltr-label mb-5">DATA SOURCES</p>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[40px] font-light text-[#1c1c1c] leading-[1.12] tracking-[-0.02em]">
              Where our data comes from
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#dee2e6] rounded-lg overflow-hidden">
            {dataSources.map((source, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
                className="bg-[#ffffff] p-8 lg:p-10"
              >
                <div className="flex items-start justify-between mb-4">
                  <BlueprintIcon icon="database" size={20} className="text-[#e07a4a]" />
                  <span className="text-[#e07a4a] text-sm font-mono">{source.count}</span>
                </div>
                <h3 className="text-lg font-medium text-[#1c1c1c] mb-2">{source.title}</h3>
                <p className="text-[#5a5a5a] text-sm leading-relaxed">{source.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mt-12 pt-12 border-t border-[#e9ecef]"
          >
            {[
              { value: "6.5B+", label: "Total Records" },
              { value: "500K+", label: "Daily Updates" },
              { value: "<1min", label: "Alert Latency" },
              { value: "99.9%", label: "Uptime SLA" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.35 + index * 0.08 }}
              >
                <div className="text-[24px] sm:text-[28px] lg:text-[34px] font-light text-[#1c1c1c] mb-1 font-mono tracking-tight">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-[#adb5bd] uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
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
              <p className="pltr-label mb-5">CAPABILITIES</p>
              <h2 className="text-[26px] sm:text-[32px] lg:text-[38px] font-light text-[#f1f3f5] leading-[1.12] tracking-[-0.02em] mb-6">
                Comprehensive threat detection
              </h2>
              <p className="text-[#868e96] text-base sm:text-lg leading-relaxed">
                Our platform provides the tools security teams need to identify and respond to credential exposures before they lead to account takeover or data breaches.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
              className="space-y-0"
            >
              {capabilities.map((capability, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                  className="py-4 border-b border-[#2a2a2a] flex items-center gap-3"
                >
                  <BlueprintIcon icon="tick" size={14} className="text-[#e07a4a] flex-shrink-0" />
                  <span className="text-[#f1f3f5] text-sm">{capability}</span>
                </motion.div>
              ))}
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
              Start protecting your organization today
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
                  Access Dashboard
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
