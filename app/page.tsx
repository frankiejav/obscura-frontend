"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"
import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import DataPipelineAnimation from "@/components/data-pipeline-animation"

function BlueprintIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      {icon === "arrow-top-right" && (
        <path d="M5 3h8v8l-1-1V4.41L4.41 12l-.7-.71L11.29 4H6L5 3z" fillRule="evenodd" />
      )}
      {icon === "search" && (
        <path d="M10.68 11.39a6 6 0 1 1 .71-.71l4.27 4.27-.71.7-4.27-4.26zM6 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fillRule="evenodd" />
      )}
      {icon === "shield" && (
        <path d="M8 0l7 3v4c0 3.53-2.61 6.74-7 8-4.39-1.26-7-4.47-7-8V3l7-3zm0 1.11L2 3.72V7c0 2.89 2.2 5.55 6 6.72 3.8-1.17 6-3.83 6-6.72V3.72L8 1.11z" fillRule="evenodd" />
      )}
      {icon === "eye-open" && (
        <path d="M8 3C4.51 3 1.63 5.36.15 8c1.48 2.64 4.36 5 7.85 5s6.37-2.36 7.85-5c-1.48-2.64-4.36-5-7.85-5zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fillRule="evenodd" />
      )}
      {icon === "key" && (
        <path d="M11 0a5 5 0 0 0-4.916 5.916L0 12v3a1 1 0 0 0 1 1h1v-2h2v-2h2v-2h2.084A5 5 0 1 0 11 0zm1 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fillRule="evenodd" />
      )}
      {icon === "database" && (
        <path d="M2 3.5C2 1.57 4.69 0 8 0s6 1.57 6 3.5V5c0 1.93-2.69 3.5-6 3.5S2 6.93 2 5V3.5zm0 4.35V11c0 1.93 2.69 3.5 6 3.5s6-1.57 6-3.5V7.85c-1.33 1.04-3.53 1.65-6 1.65s-4.67-.61-6-1.65zM8 1C5.24 1 3 2.12 3 3.5S5.24 6 8 6s5-1.12 5-2.5S10.76 1 8 1z" fillRule="evenodd" />
      )}
      {icon === "download" && (
        <path d="M7 0v8.17L4.41 5.59 3 7l5 5 5-5-1.41-1.41L9 8.17V0H7zm8 14v2H1v-2h14z" fillRule="evenodd" />
      )}
      {icon === "arrow-right" && (
        <path d="M10.71 7.29l-4-4-.71.71L9.59 7.5H1v1h8.59L6 12l.71.71 4-4a.5.5 0 0 0 0-.71z" fillRule="evenodd" />
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

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.98])

  const capabilities = [
    {
      icon: "search",
      title: "Exposure Search",
      description: "Query emails, domains, usernames, and device fingerprints across all collected threat data."
    },
    {
      icon: "shield",
      title: "Session Detection",
      description: "Identify stolen cookies and authentication tokens from compromised systems."
    },
    {
      icon: "eye-open",
      title: "Identity Monitoring",
      description: "Real-time monitoring for domains and identities with instant alerts."
    },
    {
      icon: "key",
      title: "Credential Analysis",
      description: "Track password exposures and credential patterns across sources."
    },
    {
      icon: "database",
      title: "Data Normalization",
      description: "Advanced correlation and deduplication across billions of records."
    },
    {
      icon: "download",
      title: "API & Export",
      description: "Programmatic access and bulk export for security research."
    }
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f7f6f3]">
      <Header />

      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center pt-20 sm:pt-24 overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(224,122,74,0.06) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(206,212,218,0.3) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 sm:py-16 lg:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-3"
            >
              <motion.p 
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="pltr-label mb-4 sm:mb-6"
              >
                IDENTITY EXPOSURE INTELLIGENCE
              </motion.p>

              <motion.h1 
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="text-[32px] sm:text-[40px] lg:text-[52px] xl:text-[58px] font-light text-[#1c1c1c] leading-[1.08] tracking-[-0.03em] mb-6 sm:mb-8"
              >
                Your Adversaries' Data.<br className="hidden sm:block" />
                <span className="text-[#868e96]">Your Advantage.</span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="text-[#5a5a5a] text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-lg"
              >
                Real-time monitoring and alerts for exposed credentials and session data. Protect your organization from identity threats.
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
                    className="pltr-btn-primary px-6 py-3 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    Get Started
                    <BlueprintIcon icon="arrow-top-right" size={14} />
                  </motion.button>
              </Link>
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pltr-btn-secondary px-6 py-3 w-full sm:w-auto"
                  >
                    Request Demo
                  </motion.button>
              </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-2 flex justify-center lg:justify-end"
            >
              <DataPipelineAnimation />
            </motion.div>
          </div>
            </div>
      </motion.section>

      <section className="pltr-section py-20 sm:py-24 lg:py-32 bg-[#ffffff] pltr-grain">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <p className="pltr-label mb-5">PLATFORM</p>
              <h2 className="text-[26px] sm:text-[32px] lg:text-[40px] font-light text-[#1c1c1c] leading-[1.12] tracking-[-0.02em]">
                From raw data to security insights in real-time
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
              className="space-y-6"
            >
              <p className="text-[#5a5a5a] text-base sm:text-lg leading-relaxed">
                We aggregate data from infostealers, ransomware leaks, database breaches, and underground forums. Our platform normalizes and correlates billions of records to deliver actionable threat intelligence.
              </p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="grid grid-cols-3 gap-6 sm:gap-8 pt-6 sm:pt-8 border-t border-[#e9ecef]"
              >
                {[
                  { value: "6.5B+", label: "Records" },
                  { value: "<1m", label: "Latency" },
                  { value: "500K+", label: "Daily" }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
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
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pltr-section pltr-section-dark py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="mb-12 sm:mb-16"
          >
            <p className="pltr-label mb-5">CAPABILITIES</p>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[38px] font-light text-[#f1f3f5] leading-[1.12] tracking-[-0.02em] max-w-2xl">
              Comprehensive tooling for identity threat analysis
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#2a2a2a] rounded-lg overflow-hidden">
            {capabilities.map((capability, index) => (
              <motion.div
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.06,
                  ease: [0.25, 0.4, 0.25, 1]
                }}
                className="bg-[#1c1c1c] p-6 sm:p-8 lg:p-10 group hover:bg-[#222] transition-colors duration-300"
              >
                <BlueprintIcon icon={capability.icon} size={20} className="text-[#5a5a5a] mb-5 group-hover:text-[#e07a4a] transition-colors duration-300" />
                <h3 className="text-base sm:text-lg font-medium text-[#f1f3f5] mb-2 sm:mb-3">
                  {capability.title}
                </h3>
                <p className="text-[#868e96] text-sm leading-relaxed">
                  {capability.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pltr-section py-20 sm:py-24 lg:py-32 bg-[#f7f6f3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <p className="pltr-label mb-5">DATA SOURCES</p>
              <h2 className="text-[26px] sm:text-[32px] lg:text-[40px] font-light text-[#1c1c1c] leading-[1.12] tracking-[-0.02em] mb-5 sm:mb-6">
                Intelligence from the underground
              </h2>
              <p className="text-[#5a5a5a] text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                We continuously monitor and ingest data from threat actor channels, malware logs, and breach repositories to provide comprehensive coverage.
              </p>
              <Link href="/about">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pltr-btn-secondary px-6 py-3 inline-flex items-center gap-2"
                >
                  Learn More
                  <BlueprintIcon icon="arrow-right" size={14} />
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
              className="space-y-0"
            >
              {[
                { label: "Infostealer Logs", desc: "RedLine, LummaC2, Raccoon, Vidar and more" },
                { label: "Ransomware Leaks", desc: "Corporate data exposures" },
                { label: "Database Breaches", desc: "Credential dumps and leaks" },
                { label: "Underground Forums", desc: "Threat actor marketplaces" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.25 + index * 0.08 }}
                  className="py-4 sm:py-5 border-b border-[#dee2e6] cursor-default group"
                >
                  <div className="text-[#1c1c1c] font-medium mb-1 group-hover:text-[#e07a4a] transition-colors duration-200">
                    {item.label}
              </div>
                  <div className="text-[#adb5bd] text-sm">
                    {item.desc}
            </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pltr-section py-20 sm:py-24 lg:py-32 bg-[#ffffff] pltr-grain">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <p className="pltr-label mb-5">ACCESS</p>
              <h2 className="text-[26px] sm:text-[32px] lg:text-[40px] font-light text-[#1c1c1c] leading-[1.12] tracking-[-0.02em] mb-5 sm:mb-6">
                Built for security professionals
              </h2>
              <p className="text-[#5a5a5a] text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                Access is limited to vetted organizations, researchers, and law enforcement with legitimate security needs. We provide complimentary access to verified law enforcement agencies.
              </p>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pltr-btn-primary px-6 py-3 inline-flex items-center gap-2"
                >
                  Request Access
                  <BlueprintIcon icon="arrow-top-right" size={14} />
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
              className="space-y-0"
            >
              {[
                { title: "Corporate Security", desc: "Enterprise organizations protecting accounts" },
                { title: "Security Researchers", desc: "Academic and independent research" },
                { title: "Law Enforcement", desc: "Free access for verified agencies" },
                { title: "Threat Analysts", desc: "Professional intelligence teams" },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                  className="py-4 sm:py-5 border-b border-[#e9ecef] cursor-default group"
                >
                  <div className="text-[#1c1c1c] font-medium mb-1 group-hover:text-[#e07a4a] transition-colors duration-200">
                    {item.title}
                    </div>
                  <div className="text-[#adb5bd] text-sm">
                    {item.desc}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pltr-section py-24 sm:py-32 lg:py-40 bg-[#f7f6f3] relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] bg-[#e07a4a]/[0.04] rounded-full blur-3xl" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <p className="pltr-label mb-5">GET STARTED</p>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[44px] font-light text-[#1c1c1c] leading-[1.1] tracking-[-0.02em] mb-8 max-w-2xl mx-auto">
              Ready to protect your organization?
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
                  className="pltr-btn-primary px-8 py-3 w-full sm:w-auto"
                >
                  Access Dashboard
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
