"use client"

import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { motion } from "motion/react"

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

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <Header />

      <section className="relative pt-32 pb-16 px-6 lg:px-8">
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
              LEGAL
            </motion.p>
            <motion.h1 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[32px] sm:text-[40px] lg:text-[52px] font-light text-[#1c1c1c] leading-[1.08] tracking-[-0.03em] mb-5"
            >
              Terms of Service
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[#5a5a5a] text-base sm:text-lg"
            >
              <strong className="text-[#1c1c1c]">Obscura Labs LLC</strong>
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="pltr-section py-16 lg:py-24 px-6 lg:px-8 bg-[#ffffff] pltr-grain">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="border border-[#e9ecef] rounded-lg p-8 lg:p-12 bg-white"
          >
            <div className="prose max-w-none">
              <p className="text-[#5a5a5a] leading-relaxed mb-8">
                By accessing or using Obscura Labs' services, you agree to these Terms of Service.
              </p>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">1. Authorized Use</h2>
              <ul className="space-y-2 text-[#5a5a5a] text-sm list-disc list-inside leading-relaxed">
                <li>Our services may only be used for defensive cybersecurity, fraud prevention, and investigative purposes.</li>
                <li>You may not use our data to gain unauthorized access to systems, accounts, or networks.</li>
              </ul>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">2. Access Restrictions</h2>
              <ul className="space-y-2 text-[#5a5a5a] text-sm list-disc list-inside leading-relaxed">
                <li>Access is limited to vetted organizations, accredited researchers, and verified law enforcement agencies.</li>
                <li>Obscura Labs reserves the right to refuse or revoke access if misuse is suspected.</li>
              </ul>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">3. Data Confidentiality</h2>
              <ul className="space-y-2 text-[#5a5a5a] text-sm list-disc list-inside leading-relaxed">
                <li>Data provided by Obscura Labs must be treated as confidential and may not be redistributed without explicit written consent.</li>
                <li>Customers must implement reasonable safeguards to protect any data received.</li>
              </ul>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">4. Free Access</h2>
              <p className="text-[#5a5a5a] text-sm leading-relaxed">
                Law enforcement and accredited researchers may request free access for investigative and public-interest purposes. Approval is at Obscura Labs' discretion.
              </p>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">5. Liability</h2>
              <ul className="space-y-2 text-[#5a5a5a] text-sm list-disc list-inside leading-relaxed">
                <li>Obscura Labs provides data "as is" without warranty. While we strive for accuracy, we cannot guarantee completeness or correctness of the data.</li>
                <li>Obscura Labs shall not be liable for misuse of data by customers.</li>
              </ul>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">6. Termination</h2>
              <p className="text-[#5a5a5a] text-sm leading-relaxed">
                We may suspend or terminate accounts that violate these Terms.
              </p>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">7. Contact Information</h2>
              <p className="text-[#5a5a5a] text-sm leading-relaxed">
                For questions about these Terms of Service, please contact us at <a href="mailto:legal@obscuralabs.com" className="text-[#e07a4a] hover:underline">legal@obscuralabs.com</a>.
              </p>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">8. Changes to Terms</h2>
              <p className="text-[#5a5a5a] text-sm leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated effective date. Continued use of our services constitutes acceptance of any changes.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
