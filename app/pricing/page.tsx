"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, ChevronDown, ChevronUp, Zap, Shield, Building2, ArrowRight, Calendar, Clock, Infinity, Briefcase, Plus } from "lucide-react"
import Link from "next/link"

const pricingPlans = [
  {
    name: "Daily Plan",
    description: "Perfect for occasional users",
    price: "$2.99",
    period: "/day",
    features: [
      { name: "15 lookups per day", included: true },
      { name: "Email/username search only", included: true },
      { name: "Dashboard access", included: true },
      { name: "Keyword alerts", included: false },
      { name: "API access", included: false },
      { name: "Bulk lookups", included: false },
      { name: "CSV/JSON exports", included: false },
      { name: "Priority support", included: false },
    ],
    icon: <Clock className="h-6 w-6" />,
    popular: false,
    cta: "Get Started",
  },
  {
    name: "Monthly Plan",
    description: "Best for regular users",
    price: "$9.99",
    period: "/month",
    features: [
      { name: "200 lookups per day", included: true },
      { name: "15 keyword alerts per day", included: true },
      { name: "Basic monitoring", included: true },
      { name: "CSV/JSON exports", included: true },
      { name: "Dashboard access", included: true },
      { name: "API access", included: false },
      { name: "Bulk lookups", included: false },
      { name: "Priority support", included: false },
    ],
    icon: <Calendar className="h-6 w-6" />,
    popular: true,
    cta: "Try Demo",
  },
  {
    name: "Lifetime Plan",
    description: "One-time payment, lifetime access",
    price: "$69.99",
    period: "one-time",
    features: [
      { name: "400 lookups per day", included: true },
      { name: "30 keyword alerts per day", included: true },
      { name: "Lifetime dashboard access", included: true },
      { name: "Basic monitoring", included: true },
      { name: "CSV/JSON exports", included: true },
      { name: "API access", included: false },
      { name: "Bulk lookups", included: false },
      { name: "Priority support", included: false },
    ],
    icon: <Infinity className="h-6 w-6" />,
    popular: false,
    cta: "Buy Lifetime Access",
  },
  {
    name: "Professional",
    description: "For security professionals & businesses",
    price: "$99",
    period: "/quarter",
    features: [
      { name: "10,000 API credits per quarter", included: true },
      { name: "Bulk lookups", included: true },
      { name: "Keyword monitoring", included: true },
      { name: "Reverse search (password/domain)", included: true },
      { name: "API access with higher rate limits", included: true },
      { name: "CSV/JSON exports", included: true },
      { name: "Priority support", included: true },
      { name: "Advanced analytics", included: true },
    ],
    icon: <Briefcase className="h-6 w-6" />,
    popular: false,
    cta: "Get Started",
  },
  {
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    price: "Custom",
    period: "pricing",
    features: [
      { name: "Unlimited or negotiated API credits", included: true },
      { name: "Real-time breach feeds & alerts", included: true },
      { name: "Full API access with SLAs", included: true },
      { name: "Custom analytics & reporting", included: true },
      { name: "Dedicated 24/7 support team", included: true },
      { name: "SLA guarantees", included: true },
      { name: "Custom integrations", included: true },
      { name: "White-label options", included: true },
    ],
    icon: <Building2 className="h-6 w-6" />,
    popular: false,
    cta: "Contact Sales",
  },
]

const apiCredits = [
  {
    credits: "1,000",
    price: "$15",
    perCredit: "$0.015",
  },
  {
    credits: "5,000",
    price: "$60",
    perCredit: "$0.012",
    popular: true,
  },
  {
    credits: "10,000",
    price: "$100",
    perCredit: "$0.010",
  },
  {
    credits: "25,000",
    price: "$200",
    perCredit: "$0.008",
  },
  {
    credits: "100,000",
    price: "$700",
    perCredit: "$0.007",
  },
]

const faqs = [
  {
    question: "What's included in the demo?",
    answer: "The demo allows you to explore the dashboard interface and view redacted search results to understand how our platform works. No monitoring features are included in the demo."
  },
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can change your plan at any time. Upgrades take effect immediately and are prorated. Downgrades take effect at the start of your next billing cycle. The Lifetime plan is a one-time purchase and cannot be refunded."
  },
  {
    question: "What are API credits?",
    answer: "API credits are used for programmatic access to our search functionality and are available exclusively with Professional and Enterprise plans. Each API call consumes one credit."
  },
  {
    question: "What's the difference between lookups and API credits?",
    answer: "Lookups are searches performed through our web dashboard, while API credits are for programmatic access via our REST API. Only Professional and Enterprise plans include API access."
  },
  {
    question: "What types of monitoring do you offer?",
    answer: "We offer two types of monitoring: Identity-based monitoring (email, phone, username, domain) and Keyword-based monitoring (e.g., wildcard patterns like helpdesk*@gmail.com). Both continuously scan for new data exposures."
  },
  {
    question: "What data sources do you monitor?",
    answer: "We monitor numerous underground forums, messaging platforms (e.g., Telegram), and ransomware leak sites for data exposure, ensuring comprehensive coverage of potential breaches."
  },
  {
    question: "Do you offer volume discounts?",
    answer: "Yes, we offer custom pricing for high-volume usage and enterprise deployments. Contact our sales team for bulk API credit pricing and custom packages."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept credit/debit cards, Apple Pay, and Google Pay through Stripe, as well as cryptocurrency payments via NOWPayments."
  }
]

export default function PricingPage() {
  const router = useRouter()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handlePlanSelect = (planName: string) => {
    if (planName === "Enterprise") {
      router.push("/contact")
    } else {
      router.push("/login")
    }
  }

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
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
            Subscription Plans
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Flexible pricing options for individuals, businesses, and enterprises. Choose what works best for you.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative bg-gray-900 border flex flex-col h-full ${
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
                  <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-400 ml-1 text-sm">
                      {plan.period}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-white mr-2 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4 pb-6">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                    } transition-all`}
                    onClick={() => handlePlanSelect(plan.name)}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Credits Section */}
      <section className="py-20 px-4 border-t border-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              API Credit Pricing
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Need more API credits? Available exclusively for Professional and Enterprise plans as add-on packages.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {apiCredits.map((tier, index) => (
              <Card
                key={index}
                className={`bg-gray-900 border ${
                  tier.popular ? "border-white shadow-lg" : "border-gray-800"
                } transition-all hover:border-gray-600`}
              >
                {tier.popular && (
                  <div className="bg-white text-black text-xs font-bold px-2 py-1 text-center">
                    BEST VALUE
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{tier.credits}</p>
                    <p className="text-gray-400 text-sm">credits</p>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{tier.price}</p>
                    <p className="text-gray-500 text-xs mt-1">{tier.perCredit} per credit</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gray-800 text-white hover:bg-gray-700 border border-gray-700 transition-all"
                    onClick={() => router.push('/login')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Purchase
                  </Button>
                </CardFooter>
              </Card>
            ))}
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
            Try our demo to explore the platform or choose the plan that fits your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 px-8"
              onClick={() => router.push('/login')}
            >
              Try Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white hover:text-black px-8"
              onClick={() => router.push('/contact')}
            >
              Contact Sales
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
              <Link href="/contact" className="hover:text-white transition-colors">
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