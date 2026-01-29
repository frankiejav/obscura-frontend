"use client"

import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { motion } from "motion/react"
import Link from "next/link"

function BlueprintIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      {icon === "arrow-top-right" && (
        <path d="M5 3h8v8l-1-1V4.41L4.41 12l-.7-.71L11.29 4H6L5 3z" fillRule="evenodd" />
      )}
      {icon === "tick" && (
        <path d="M14 3c-.28 0-.53.11-.71.29L6 10.59l-3.29-3.3a1.003 1.003 0 0 0-1.42 1.42l4 4c.18.18.43.29.71.29s.53-.11.71-.29l8-8A1.003 1.003 0 0 0 14 3z" fillRule="evenodd" />
      )}
      {icon === "shield" && (
        <path d="M8 0l7 3v4c0 3.53-2.61 6.74-7 8-4.39-1.26-7-4.47-7-8V3l7-3zm0 1.11L2 3.72V7c0 2.89 2.2 5.55 6 6.72 3.8-1.17 6-3.83 6-6.72V3.72L8 1.11z" fillRule="evenodd" />
      )}
      {icon === "people" && (
        <path d="M13.69 10.43c-.79-.49-1.97-.97-3.41-1.32.7-.51 1.2-1.36 1.34-2.35.02-.1.03-.21.03-.32v-.38a2.34 2.34 0 0 0-.2-.95 2.02 2.02 0 0 0-.56-.75 2.49 2.49 0 0 0-.85-.49A3.02 3.02 0 0 0 9 4a3.02 3.02 0 0 0-1.04.17c-.32.1-.61.27-.85.49-.24.22-.43.47-.56.75-.13.29-.2.61-.2.95v.38c0 .11.01.21.03.32.14.99.64 1.84 1.34 2.35-1.44.35-2.62.83-3.41 1.32C3.49 11 3 11.67 3 12.4c0 .53.31.99.75 1.21.47.23 1.02.39 1.61.39h5.28c.59 0 1.14-.16 1.61-.39.44-.22.75-.68.75-1.21 0-.73-.49-1.4-1.31-1.97z" fillRule="evenodd" />
      )}
      {icon === "target" && (
        <path d="M7.5 0C11.64 0 15 3.36 15 7.5S11.64 15 7.5 15 0 11.64 0 7.5 3.36 0 7.5 0zm0 2C4.46 2 2 4.46 2 7.5S4.46 13 7.5 13 13 10.54 13 7.5 10.54 2 7.5 2zm0 2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" fillRule="evenodd" />
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

const stats = [
  { number: "6.5B+", label: "Records" },
  { number: "500K+", label: "Daily Updates" },
  { number: "<1min", label: "Alert Latency" },
  { number: "24/7", label: "Monitoring" },
]

const values = [
  {
    icon: "shield",
    title: "Security First",
    description: "We prioritize the security and privacy of all data, ensuring it's used exclusively for defensive purposes."
  },
  {
    icon: "people",
    title: "Vetted Access",
    description: "Access is limited to verified organizations, researchers, and law enforcement with legitimate security needs."
  },
  {
    icon: "target",
    title: "Actionable Intelligence",
    description: "We provide normalized, deduplicated data that security teams can immediately act upon."
  }
]

export default function AboutPage() {
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
              ABOUT
            </motion.p>
            <motion.h1 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[32px] sm:text-[40px] lg:text-[52px] font-light text-[#1c1c1c] leading-[1.08] tracking-[-0.03em] max-w-4xl"
            >
              Identity threat intelligence at scale
            </motion.h1>
          </motion.div>
        </div>
      </section>

      <section className="pltr-section py-20 sm:py-24 lg:py-32 px-6 lg:px-8 bg-[#ffffff] pltr-grain">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <p className="pltr-label mb-5">MISSION</p>
              <h2 className="text-[26px] sm:text-[32px] lg:text-[40px] font-light text-[#1c1c1c] leading-[1.12] tracking-[-0.02em]">
                Transforming raw threat data into actionable security intelligence
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <p className="text-[#5a5a5a] text-base sm:text-lg leading-relaxed mb-6">
                Obscura Labs provides identity exposure intelligence by aggregating and normalizing data from infostealers, ransomware leaks, database breaches, and underground forums.
              </p>
              <p className="text-[#5a5a5a] text-base sm:text-lg leading-relaxed">
                Our goal is to prevent account takeover, fraud, and identity theft by giving vetted organizations and researchers access to real-time threat data.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mt-16 pt-16 border-t border-[#e9ecef]"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.35 + index * 0.08 }}
              >
                <div className="text-[24px] sm:text-[28px] lg:text-[34px] font-light text-[#1c1c1c] mb-1 font-mono tracking-tight">{stat.number}</div>
                <div className="text-[10px] sm:text-xs text-[#adb5bd] uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
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
            <p className="pltr-label mb-5">DATA SOURCES</p>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[40px] font-light text-[#1c1c1c] leading-[1.12] tracking-[-0.02em]">
              What we collect
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#dee2e6] rounded-lg overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
              className="bg-[#ffffff] p-8 lg:p-10"
            >
              <h3 className="text-lg font-medium text-[#1c1c1c] mb-6">Data Collection</h3>
              <ul className="space-y-4">
                {["Infostealer logs and malware infections", "Ransomware data exposures", "Database breaches and leaks", "Underground forums and marketplaces"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <BlueprintIcon icon="tick" size={14} className="text-[#e07a4a] mt-1 flex-shrink-0" />
                    <span className="text-[#5a5a5a] text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
              className="bg-[#ffffff] p-8 lg:p-10"
            >
              <h3 className="text-lg font-medium text-[#1c1c1c] mb-6">Processing</h3>
              <ul className="space-y-4">
                {["Advanced normalization and deduplication", "Real-time monitoring and alerting", "API access for bulk analysis", "Historical trend analysis"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <BlueprintIcon icon="tick" size={14} className="text-[#e07a4a] mt-1 flex-shrink-0" />
                    <span className="text-[#5a5a5a] text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
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
            <p className="pltr-label mb-5">VALUES</p>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[38px] font-light text-[#f1f3f5] leading-[1.12] tracking-[-0.02em]">
              Our principles
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#2a2a2a] rounded-lg overflow-hidden">
            {values.map((value, index) => (
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
                <BlueprintIcon icon={value.icon} size={20} className="text-[#5a5a5a] mb-5 group-hover:text-[#e07a4a] transition-colors duration-300" />
                <h3 className="text-base sm:text-lg font-medium text-[#f1f3f5] mb-2 sm:mb-3">{value.title}</h3>
                <p className="text-[#868e96] text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
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
              Ready to get started?
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
                  Contact Us
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
