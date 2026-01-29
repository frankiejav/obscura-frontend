"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"

function BlueprintIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      {icon === "tick" && (
        <path d="M14 3c-.28 0-.53.11-.71.29L6 10.59l-3.29-3.3a1.003 1.003 0 0 0-1.42 1.42l4 4c.18.18.43.29.71.29s.53-.11.71-.29l8-8A1.003 1.003 0 0 0 14 3z" fillRule="evenodd" />
      )}
      {icon === "cross" && (
        <path d="M8.7 8l3.15-3.15-.7-.7L8 7.29 4.85 4.15l-.7.7L7.29 8l-3.14 3.15.7.7L8 8.71l3.15 3.14.7-.7L8.71 8z" fillRule="evenodd" />
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

type BillingCycle = 'monthly' | 'yearly'

interface PlanPricing {
  monthly: number
  yearly: number
  yearlySavings: string
}

interface PricingPlan {
  name: string
  tier: 'starter' | 'professional' | 'enterprise'
  description: string
  pricing: PlanPricing | null
  features: { name: string; included: boolean }[]
  popular: boolean
  cta: string
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    tier: "starter",
    description: "For individuals and researchers",
    pricing: {
      monthly: 19.99,
      yearly: 191.88,
      yearlySavings: "Save 20%"
    },
    features: [
      { name: "200 lookups per day", included: true },
      { name: "Dashboard access", included: true },
      { name: "CSV/JSON exports", included: true },
      { name: "30-day data retention", included: true },
      { name: "Credential Monitoring", included: false },
      { name: "API access", included: false },
    ],
    popular: false,
    cta: "Get Started",
  },
  {
    name: "Professional",
    tier: "professional",
    description: "For security teams",
    pricing: {
      monthly: 49,
      yearly: 349,
      yearlySavings: "Save 25%"
    },
    features: [
      { name: "Unlimited lookups", included: true },
      { name: "10,000 API credits/month", included: true },
      { name: "Credential Monitoring (100 targets)", included: true },
      { name: "Full API access", included: true },
      { name: "Team collaboration (5 members)", included: true },
      { name: "Priority support", included: true },
    ],
    popular: true,
    cta: "Try Professional",
  },
  {
    name: "Enterprise",
    tier: "enterprise",
    description: "For large organizations",
    pricing: {
      monthly: 299,
      yearly: 2868,
      yearlySavings: "Save 20%"
    },
    features: [
      { name: "Everything in Professional", included: true },
      { name: "Unlimited API credits", included: true },
      { name: "Real-time data feeds", included: true },
      { name: "Custom analytics", included: true },
      { name: "Unlimited monitoring targets", included: true },
      { name: "24/7 dedicated support", included: true },
    ],
    popular: false,
    cta: "Contact Sales",
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly')

  const handlePlanSelect = (plan: PricingPlan) => {
    if (plan.tier === "enterprise") {
      router.push("/contact")
    } else if (plan.pricing) {
      const price = billingCycle === 'yearly' ? plan.pricing.yearly : plan.pricing.monthly
      router.push(`/checkout?plan=${plan.name}&price=${price}&cycle=${billingCycle}`)
    }
  }

  const formatPrice = (plan: PricingPlan) => {
    if (!plan.pricing) return { price: "Custom", period: "" }
    
    if (billingCycle === 'yearly') {
      const monthlyEquivalent = Math.round(plan.pricing.yearly / 12 * 100) / 100
      return { 
        price: `$${monthlyEquivalent.toFixed(0)}`, 
        period: "/mo",
        billed: `$${plan.pricing.yearly}/year`
      }
    }
    return { 
      price: `$${plan.pricing.monthly}`, 
      period: "/mo",
      billed: "billed monthly"
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <Header />
      
      <section className="relative pt-32 pb-20 sm:pb-24 lg:pb-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mb-12 sm:mb-16"
          >
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="pltr-label mb-5"
            >
              PRICING
            </motion.p>
            <motion.h1 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[32px] sm:text-[40px] lg:text-[52px] font-light text-[#1c1c1c] leading-[1.08] tracking-[-0.03em] mb-5"
            >
              Choose your plan
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[#5a5a5a] text-base sm:text-lg max-w-xl"
            >
              Flexible pricing for security teams and researchers.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-10"
          >
            <div className="inline-flex items-center bg-white rounded-full p-1 border border-[#dee2e6]">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-[#1c1c1c] text-white'
                    : 'text-[#5a5a5a] hover:text-[#1c1c1c]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-[#1c1c1c] text-white'
                    : 'text-[#5a5a5a] hover:text-[#1c1c1c]'
                }`}
              >
                Yearly
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  billingCycle === 'yearly' 
                    ? 'bg-[#e07a4a] text-white' 
                    : 'bg-[#e07a4a]/10 text-[#e07a4a]'
                }`}>
                  Save 20%+
                </span>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#dee2e6] rounded-lg overflow-hidden">
            {pricingPlans.map((plan, index) => {
              const priceInfo = formatPrice(plan)
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                  className={`p-8 lg:p-10 flex flex-col relative ${
                    plan.popular ? 'bg-[#ffffff]' : 'bg-[#fafafa]'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#e07a4a]" />
                  )}
                  
                  {plan.popular && (
                    <div className="absolute top-4 right-4">
                      <span className="text-xs font-medium text-[#e07a4a] bg-[#e07a4a]/10 px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                    
                  <div className="mb-8">
                    <p className="text-xs text-[#adb5bd] uppercase tracking-wider mb-2">
                      {plan.description}
                    </p>
                    <h2 className="text-2xl font-light text-[#1c1c1c]">
                      {plan.name}
                    </h2>
                  </div>

                  <div className="mb-2">
                    <span className="text-[36px] font-light text-[#1c1c1c] font-mono tracking-tight">
                      {priceInfo.price}
                    </span>
                    <span className="text-[#adb5bd] text-sm ml-1">
                      {priceInfo.period}
                    </span>
                  </div>
                  
                  {plan.pricing && (
                    <div className="mb-8">
                      <span className="text-xs text-[#868e96]">
                        {priceInfo.billed}
                      </span>
                      {billingCycle === 'yearly' && plan.pricing.yearlySavings && (
                        <span className="ml-2 text-xs text-[#e07a4a] font-medium">
                          {plan.pricing.yearlySavings}
                        </span>
                      )}
                    </div>
                  )}

                  {!plan.pricing && (
                    <div className="mb-8">
                      <span className="text-xs text-[#868e96]">
                        Contact us for pricing
                      </span>
                    </div>
                  )}

                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        {feature.included ? (
                          <BlueprintIcon icon="tick" size={14} className="text-[#e07a4a] flex-shrink-0" />
                        ) : (
                          <BlueprintIcon icon="cross" size={14} className="text-[#ced4da] flex-shrink-0" />
                        )}
                        <span className={feature.included ? "text-[#5a5a5a] text-sm" : "text-[#ced4da] text-sm"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full py-3 text-sm flex items-center justify-center gap-2 ${
                      plan.popular 
                        ? 'pltr-btn-primary' 
                        : 'pltr-btn-secondary'
                    }`}
                  >
                    {plan.cta}
                    <BlueprintIcon icon="arrow-top-right" size={14} />
                  </motion.button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="pltr-section py-20 sm:py-24 lg:py-32 bg-[#ffffff] pltr-grain">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <p className="pltr-label mb-5">ENTERPRISE</p>
              <h2 className="text-[26px] sm:text-[32px] lg:text-[40px] font-light text-[#1c1c1c] leading-[1.12] tracking-[-0.02em] mb-5 sm:mb-6">
                Custom solutions for large organizations
              </h2>
              <p className="text-[#5a5a5a] text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                Need a custom plan? We offer tailored solutions with dedicated support, custom integrations, and flexible pricing for enterprise requirements.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/contact')}
                className="pltr-btn-primary px-6 py-3 inline-flex items-center gap-2"
              >
                Contact Sales
                <BlueprintIcon icon="arrow-top-right" size={14} />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
              className="space-y-0"
            >
              {[
                { label: "Dedicated Support", desc: "24/7 priority support with dedicated account manager" },
                { label: "Custom Integrations", desc: "SIEM, SOAR, and custom API integrations" },
                { label: "Volume Pricing", desc: "Flexible pricing based on your usage" },
                { label: "SLA Guarantees", desc: "99.9% uptime with contractual guarantees" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.25 + index * 0.08 }}
                  className="py-4 sm:py-5 border-b border-[#e9ecef] cursor-default group"
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
            <p className="pltr-label mb-5">QUESTIONS</p>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[44px] font-light text-[#1c1c1c] leading-[1.1] tracking-[-0.02em] mb-8 max-w-2xl mx-auto">
              Not sure which plan is right for you?
            </h2>
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/contact')}
                className="pltr-btn-secondary px-8 py-3 inline-flex items-center justify-center gap-2"
              >
                Talk to Sales
                <BlueprintIcon icon="arrow-top-right" size={14} />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
