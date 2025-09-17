"use client"

import { useRouter } from "next/navigation"
import Header from "@/components/navigation/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Shield, ArrowRight, Zap, Users, Building2 } from "lucide-react"

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for individuals",
    price: "$19.99",
    period: "/month",
    features: [
      { name: "200 lookups per day", included: true },
      { name: "Dashboard access", included: true },
      { name: "CSV/JSON exports", included: true },
      { name: "Credential Monitoring", included: false },
      { name: "API access", included: false },
      { name: "Priority support", included: false },
    ],
    icon: <Shield className="h-6 w-6" />,
    popular: false,
    cta: "Get Started",
  },
  {
    name: "Professional",
    description: "For security professionals",
    price: "$99",
    period: "/quarter",
    features: [
      { name: "10,000 API credits /month", included: true },
      { name: "Unlimited lookups", included: true },
      { name: "CSV/JSON exports", included: true },
      { name: "Credential Monitoring", included: true },
      { name: "API access", included: true },
      { name: "Priority support", included: true },
    ],
    icon: <Zap className="h-6 w-6" />,
    popular: true,
    cta: "Try Professional",
  },
  {
    name: "Enterprise",
    description: "Custom solutions",
    price: "Custom",
    period: "pricing",
    features: [
      { name: "Unlimited API credits", included: true },
      { name: "Real-time feeds", included: true },
      { name: "Full API access", included: true },
      { name: "Custom analytics", included: true },
      { name: "24/7 support", included: true },
      { name: "SLA guarantees", included: true },
    ],
    icon: <Building2 className="h-6 w-6" />,
    popular: false,
    cta: "Contact Sales",
  },
]

export default function PricingPage() {
  const router = useRouter()

  const handlePlanSelect = (planName: string, planPrice: string) => {
    if (planName === "Enterprise") {
      router.push("/contact")
    } else {
      // Extract numeric price from string like "$99" or "$19.99"
      const price = parseFloat(planPrice.replace(/[^0-9.]/g, ''))
      router.push(`/checkout?plan=${planName}&price=${price}`)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 py-12">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-neutral-400 text-lg">
              Flexible pricing for security teams and researchers
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <div key={index} className="relative">
                {/* Background glow */}
                <div className={`absolute inset-0 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' 
                    : 'bg-gradient-to-r from-neutral-500/10 to-neutral-600/10'
                } rounded-3xl blur-3xl`}></div>
                
                {/* Main card */}
                <div className={`relative bg-neutral-900/60 backdrop-blur-xl rounded-3xl ring-1 ${
                  plan.popular 
                    ? 'ring-white/20 hover:ring-white/30' 
                    : 'ring-white/10 hover:ring-white/20'
                } p-8 transition-all duration-500 h-full flex flex-col`}>
                  
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-white text-black px-4 py-1">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  
                  {/* Icon and title */}
                  <div className="text-center mb-6">
                    <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                      <div className={`absolute inset-0 ${
                        plan.popular ? 'bg-white' : 'bg-white/20'
                      } rounded-2xl blur-xl opacity-30`}></div>
                      <div className={`relative ${
                        plan.popular ? 'bg-white' : 'bg-white/10'
                      } rounded-2xl p-3`}>
                        <div className={plan.popular ? 'text-black' : 'text-white'}>
                          {plan.icon}
                        </div>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h2>
                    <p className="text-neutral-400 text-sm">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-neutral-400 ml-2">
                      {plan.period}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        {feature.included ? (
                          <div className="p-1 bg-green-500/20 rounded-lg mr-3">
                            <Check className="h-4 w-4 text-green-400" />
                          </div>
                        ) : (
                          <div className="p-1 bg-neutral-800 rounded-lg mr-3">
                            <X className="h-4 w-4 text-neutral-600" />
                          </div>
                        )}
                        <span className={
                          feature.included ? "text-neutral-300" : "text-neutral-600"
                        }>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button 
                    onClick={() => handlePlanSelect(plan.name, plan.price)}
                    className={`group relative w-full py-4 text-base font-semibold ${
                      plan.popular 
                        ? 'bg-white text-black hover:bg-neutral-200' 
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    } transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden`}
                    size="lg"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {plan.cta}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    {plan.popular && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="text-neutral-400 mb-6">
              Not sure which plan is right for you?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                onClick={() => router.push('/contact')}
              >
                Talk to Sales
                <Users className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                onClick={() => router.push('/login')}
              >
                Try Demo
                <Zap className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bottom links */}
          <div className="mt-12 text-center">
            <p className="text-xs text-neutral-500">
              By purchasing, you agree to our{' '}
              <a href="/terms-of-service" className="text-white/60 hover:text-white transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy-policy" className="text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}