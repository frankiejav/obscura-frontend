"use client"

import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { motion } from "motion/react"
import Link from "next/link"

function BlueprintIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      {icon === "info-sign" && (
        <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm1-2H7V7h2v5zm0-6H7V4h2v2z" fillRule="evenodd" />
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

const cookieTypes = [
  {
    title: "Essential Cookies",
    required: true,
    description: "These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you, such as setting your privacy preferences, logging in, or filling in forms.",
    examples: ["Session authentication", "Security tokens", "User preferences"]
  },
  {
    title: "Analytics Cookies",
    required: false,
    description: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site.",
    examples: ["Page view tracking", "User flow analysis", "Performance monitoring"]
  },
  {
    title: "Functional Cookies",
    required: false,
    description: "These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.",
    examples: ["Language preferences", "Region settings", "User interface customization"]
  }
]

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <Header />

      <section className="relative pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
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
              className="text-[32px] sm:text-[40px] lg:text-[52px] font-light text-[#1c1c1c] leading-[1.08] tracking-[-0.03em] mb-6"
            >
              Cookie Policy
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[#868e96] text-sm"
            >
              Last updated: January 2025
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="pltr-section py-12 px-6 lg:px-8 bg-[#ffffff] pltr-grain">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="prose prose-gray max-w-none"
          >
            <div className="space-y-12">
              <div>
                <h2 className="text-[22px] font-light text-[#1c1c1c] mb-4">What Are Cookies</h2>
                <p className="text-[#5a5a5a] text-sm leading-relaxed mb-4">
                  Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the website owners.
                </p>
                <p className="text-[#5a5a5a] text-sm leading-relaxed">
                  This Cookie Policy explains how CyberVault LLC, operating as Obscura Labs ("Obscura Labs," "we," "us," or "our"), uses cookies and similar technologies on our website and services.
                </p>
              </div>

              <div>
                <h2 className="text-[22px] font-light text-[#1c1c1c] mb-6">Types of Cookies We Use</h2>
                <div className="space-y-6">
                  {cookieTypes.map((cookie, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                      className="border border-[#e9ecef] rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-medium text-[#1c1c1c]">{cookie.title}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          cookie.required 
                            ? 'bg-[#e8f5e9] text-[#2e7d32]' 
                            : 'bg-[#f5f5f5] text-[#757575]'
                        }`}>
                          {cookie.required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-[#5a5a5a] text-sm leading-relaxed mb-4">{cookie.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {cookie.examples.map((example, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-[#f7f6f3] text-[#868e96] rounded">
                            {example}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-[22px] font-light text-[#1c1c1c] mb-4">Managing Cookies</h2>
                <p className="text-[#5a5a5a] text-sm leading-relaxed mb-4">
                  Most web browsers allow you to control cookies through their settings. You can typically find these settings in the "Options" or "Preferences" menu of your browser. The following links may be helpful:
                </p>
                <ul className="list-disc list-inside text-[#5a5a5a] text-sm space-y-2 ml-4">
                  <li>Chrome: chrome://settings/cookies</li>
                  <li>Firefox: about:preferences#privacy</li>
                  <li>Safari: Preferences {'>'} Privacy</li>
                  <li>Edge: Settings {'>'} Privacy, search, and services</li>
                </ul>
              </div>

              <div>
                <h2 className="text-[22px] font-light text-[#1c1c1c] mb-4">Third-Party Cookies</h2>
                <p className="text-[#5a5a5a] text-sm leading-relaxed mb-4">
                  We may use third-party services that set cookies on our website. These include:
                </p>
                <ul className="list-disc list-inside text-[#5a5a5a] text-sm space-y-2 ml-4">
                  <li>Analytics services (to understand how visitors use our site)</li>
                  <li>Authentication providers (Auth0)</li>
                  <li>Payment processors (Stripe)</li>
                </ul>
                <p className="text-[#5a5a5a] text-sm leading-relaxed mt-4">
                  These third parties have their own privacy policies and cookie practices.
                </p>
              </div>

              <div>
                <h2 className="text-[22px] font-light text-[#1c1c1c] mb-4">Updates to This Policy</h2>
                <p className="text-[#5a5a5a] text-sm leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this policy periodically.
                </p>
              </div>

              <div className="pt-8 border-t border-[#e9ecef]">
                <div className="flex items-start gap-3 p-5 bg-[#f7f6f3] rounded-lg">
                  <BlueprintIcon icon="info-sign" size={20} className="text-[#e07a4a] mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-[#1c1c1c] mb-1">Questions?</h3>
                    <p className="text-[#5a5a5a] text-sm">
                      If you have questions about our use of cookies, please contact us at{' '}
                      <a href="mailto:privacy@obscuralabs.io" className="text-[#e07a4a] hover:underline">
                        privacy@obscuralabs.io
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Link href="/privacy-policy" className="text-sm text-[#e07a4a] hover:underline">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="text-sm text-[#e07a4a] hover:underline">
                  Terms of Service
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
