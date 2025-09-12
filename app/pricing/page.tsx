"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, ChevronDown, ChevronUp, Zap, Shield, Building2, ArrowRight } from "lucide-react"
import Link from "next/link"

const pricingPlans = [
  {
    name: "Basic",
    description: "Perfect for individuals and small teams",
    price: "$49",
    period: "/month",
    features: [
      { name: "Up to 1,000 searches per month", included: true },
      { name: "Basic data breach monitoring", included: true },
      { name: "Email support", included: true },
      { name: "5 monitored domains", included: true },
      { name: "API access", included: false },
      { name: "Advanced analytics", included: false },
      { name: "Custom integrations", included: false },
      { name: "Priority support", included: false },
    ],
    icon: <Zap className="h-6 w-6" />,
    popular: false,
    cta: "Start Free Trial",
  },
  {
    name: "Professional",
    description: "Ideal for growing businesses and security teams",
    price: "$199",
    period: "/month",
    features: [
      { name: "Up to 10,000 searches per month", included: true },
      { name: "Advanced breach monitoring & alerts", included: true },
      { name: "Priority email & chat support", included: true },
      { name: "25 monitored domains", included: true },
      { name: "API access", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Custom integrations", included: false },
      { name: "Priority support", included: true },
    ],
    icon: <Shield className="h-6 w-6" />,
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    description: "Tailored solutions for large organizations",
    price: "Custom",
    period: "",
    features: [
      { name: "Unlimited searches", included: true },
      { name: "Real-time breach monitoring", included: true },
      { name: "24/7 dedicated support", included: true },
      { name: "Unlimited monitored domains", included: true },
      { name: "Full API access", included: true },
      { name: "Custom analytics & reporting", included: true },
      { name: "Custom integrations", included: true },
      { name: "SLA guarantees", included: true },
    ],
    icon: <Building2 className="h-6 w-6" />,
    popular: false,
    cta: "Contact Sales",
  },
]

const faqs = [
  {
    question: "What's included in the free trial?",
    answer: "Our 14-day free trial gives you full access to all Professional plan features. No credit card required to start."
  },
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated."
  },
  {
    question: "What data sources do you monitor?",
    answer: "We monitor over 500+ data breach databases, dark web sources, and infostealer logs, with new sources added continuously."
  },
  {
    question: "How does the API work?",
    answer: "Our RESTful API provides programmatic access to search functionality and monitoring alerts. Full documentation is provided with Professional and Enterprise plans."
  },
  {
    question: "Do you offer volume discounts?",
    answer: "Yes, we offer custom pricing for high-volume usage and enterprise deployments. Contact our sales team for more information."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, ACH transfers, and wire transfers for enterprise accounts."
  }
]

export default function PricingPage() {
  const router = useRouter()
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handlePlanSelect = (planName: string) => {
    if (planName === "Enterprise") {
      // For enterprise, you might want to redirect to a contact form
      router.push("/login")
    } else {
      router.push("/login")
    }
  }

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const getPrice = (basePrice: string, period: string) => {
    if (basePrice === "Custom") return basePrice
    if (billingPeriod === "yearly" && period === "/month") {
      const monthly = parseInt(basePrice.replace("$", ""))
      const yearly = monthly * 10 // 2 months free
      return `$${yearly}`
    }
    return basePrice
  }

  const getPeriod = (period: string) => {
    if (period === "") return ""
    return billingPeriod === "yearly" ? "/year" : period
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-white rounded" />
              <span className="text-xl font-bold">OBSCURA</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white hover:text-black transition-all"
                onClick={() => router.push('/login')}
              >
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Choose the perfect plan for your security needs. All plans include core features with no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`${billingPeriod === "monthly" ? "text-white" : "text-gray-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
              className="relative w-16 h-8 bg-gray-800 rounded-full transition-colors hover:bg-gray-700"
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  billingPeriod === "yearly" ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`${billingPeriod === "yearly" ? "text-white" : "text-gray-500"}`}>
              Yearly
              <Badge className="ml-2 bg-white text-black">Save 17%</Badge>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative bg-gray-900 border ${
                  plan.popular
                    ? "border-white shadow-2xl shadow-white/20 scale-105"
                    : "border-gray-800"
                } transition-all hover:border-gray-600`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-white text-black px-3 py-1">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">
                      {getPrice(plan.price, plan.period)}
                    </span>
                    <span className="text-gray-400 ml-1">
                      {getPeriod(plan.period)}
                    </span>
                    {billingPeriod === "yearly" && plan.period && plan.price !== "Custom" && (
                      <div className="text-sm text-gray-500 mt-1">
                        {plan.price}/month billed annually
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                        )}
                        <span
                          className={
                            feature.included ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                    } transition-all`}
                    onClick={() => handlePlanSelect(plan.name)}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 px-4 border-t border-gray-800">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            All Plans Include
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bank-Grade Security</h3>
              <p className="text-gray-400">
                256-bit encryption and SOC 2 Type II compliance
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Alerts</h3>
              <p className="text-gray-400">
                Instant notifications when new breaches are detected
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">99.9% Uptime</h3>
              <p className="text-gray-400">
                Reliable service with guaranteed availability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 border-t border-gray-800">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-800 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-900 transition-colors"
                >
                  <span className="font-semibold">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 py-4 border-t border-gray-800">
                    <p className="text-gray-400">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-gray-800">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Secure Your Data?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Start your free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 px-8"
              onClick={() => router.push('/login')}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white hover:text-black px-8"
              onClick={() => router.push('/')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-white rounded" />
              <span className="text-xl font-bold">OBSCURA</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            © 2025 Obscura Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
