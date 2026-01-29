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

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[#5a5a5a] text-base sm:text-lg"
            >
              <strong className="text-[#1c1c1c]">CyberVault LLC</strong>
              <span className="text-[#868e96]"> (operating as Obscura Labs)</span>
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
                CyberVault LLC, operating as Obscura Labs ("Obscura Labs," "we," "us," or "our"), is committed to protecting the security and privacy of the data we process. Our mission is to provide credential and breach intelligence to vetted organizations, security researchers, and law enforcement for the purpose of preventing account takeover, fraud, and other cybercrimes.
              </p>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">1. Data We Collect</h2>
              <div className="space-y-4 text-[#5a5a5a] text-sm leading-relaxed">
                <p><strong className="text-[#1c1c1c]">Leaked & Malware-Exfiltrated Data:</strong> We aggregate credential data (e.g., email addresses, usernames, and associated passwords) that has been exposed through data breaches, stealer malware infections, or other underground sources.</p>
                <p><strong className="text-[#1c1c1c]">Customer Data:</strong> When organizations use our services, we may collect limited account information (business name, contact details, payment information).</p>
              </div>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">2. Purpose of Processing</h2>
              <ul className="space-y-2 text-[#5a5a5a] text-sm list-disc list-inside leading-relaxed">
                <li>To enable vetted organizations to identify compromised accounts belonging to their employees or customers.</li>
                <li>To support law enforcement and accredited researchers in analyzing cybercrime trends and protecting the public.</li>
                <li>To improve our services by analyzing breach trends and credential exposure.</li>
              </ul>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">3. Data Security & Encryption</h2>
              <ul className="space-y-2 text-[#5a5a5a] text-sm list-disc list-inside leading-relaxed">
                <li>All credential data is encrypted at rest using industry-standard AES-256 encryption.</li>
                <li>All communications with our platform are encrypted in transit via TLS 1.2+.</li>
                <li>Access to decrypted data is restricted to authorized customers and staff under strict role-based access control (RBAC) and logged for audit purposes.</li>
              </ul>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">4. Free Access for Researchers & Law Enforcement</h2>
              <div className="space-y-4 text-[#5a5a5a] text-sm leading-relaxed">
                <p>We provide limited, no-cost access to accredited security researchers, academic institutions, and verified law enforcement agencies for defensive and investigative purposes.</p>
                <p>Such access requires verification and approval by Obscura Labs.</p>
              </div>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">5. Data Sharing & Restrictions</h2>
              <ul className="space-y-2 text-[#5a5a5a] text-sm list-disc list-inside leading-relaxed">
                <li>Credential data is shared exclusively with vetted organizations and researchers.</li>
                <li>We do not sell or provide raw credential data to consumers or the general public.</li>
                <li>Customers are prohibited from misusing data for surveillance, unauthorized access, or any non-defensive purpose.</li>
              </ul>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">6. Retention & Removal</h2>
              <div className="space-y-4 text-[#5a5a5a] text-sm leading-relaxed">
                <p>Data is retained for as long as necessary to provide cybersecurity defense services.</p>
                <p>Individuals may request information about whether their data has appeared in our datasets by contacting us at <a href="mailto:privacy@obscuralabs.io" className="text-[#e07a4a] hover:underline">privacy@obscuralabs.io</a>.</p>
              </div>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">7. Compliance</h2>
              <p className="text-[#5a5a5a] text-sm leading-relaxed">
                We process data in alignment with GDPR, CCPA, and other applicable privacy frameworks. While Obscura Labs is not a consumer-facing platform, we respect individual rights to privacy and will cooperate with lawful takedown or erasure requests.
              </p>

              <h2 className="text-[22px] font-light text-[#1c1c1c] mt-10 mb-4 tracking-[-0.02em]">8. Data Controller</h2>
              <p className="text-[#5a5a5a] text-sm leading-relaxed mb-4">
                The data controller for Obscura Labs is CyberVault LLC. For privacy inquiries, please contact us at <a href="mailto:privacy@obscuralabs.io" className="text-[#e07a4a] hover:underline">privacy@obscuralabs.io</a>.
              </p>
              <p className="text-[#868e96] text-xs leading-relaxed">
                Obscura Labs is a service operated by CyberVault LLC.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
