"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Mail, Phone, Building, Shield, Users, MessageSquare, Send, ArrowRight } from "lucide-react"

const contactReasons = [
  { value: "enterprise", label: "Enterprise Sales" },
  { value: "research", label: "Research Access Request" },
  { value: "law-enforcement", label: "Law Enforcement Access" },
  { value: "support", label: "Technical Support" },
  { value: "compliance", label: "Compliance & Legal" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "other", label: "Other" },
]

const contactMethods = [
  {
    icon: <Mail className="h-6 w-6 text-white" />,
    title: "Email",
    value: "contact@obscuralabs.io",
    description: "General inquiries and support"
  },
  {
    icon: <Shield className="h-6 w-6 text-white" />,
    title: "Law Enforcement",
    value: "law-enforcement@obscuralabs.io",
    description: "For verified law enforcement agencies"
  },
  {
    icon: <Users className="h-6 w-6 text-white" />,
    title: "Research Access",
    value: "research@obscuralabs.io",
    description: "Academic and research partnerships"
  },
  {
    icon: <Building className="h-6 w-6 text-white" />,
    title: "Enterprise Sales",
    value: "sales@obscuralabs.io",
    description: "Custom solutions and pricing"
  }
]

function ContactPageContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const formRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    email: string
    organization: string
    reason: string
    message: string
  }>({
    name: "",
    email: "",
    organization: "",
    reason: "",
    message: ""
  })
  
  // Ensure Select is always controlled by using undefined for empty string
  const selectValue = formData.reason === "" ? undefined : formData.reason

  const handleBetaAccessClick = () => {
    setFormData(prev => ({
      ...prev,
      name: "",
      email: "",
      organization: "",
      reason: "other",
      message: "Dear Obscura Labs Team,\n\nI am writing to request beta access to your platform.\n\nI am interested in becoming a beta tester and would like to request early access to your identity intelligence platform.\n\nThank you for your consideration.\n\nBest regards,"
    }))
    
    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => {
        document.getElementById('name')?.focus()
      }, 500)
    }, 100)
  }

  // Check for query parameter on mount
  useEffect(() => {
    const reason = searchParams.get('reason')
    if (reason === 'beta') {
      // Set form data with functional update to ensure state is properly set
      setFormData({
        name: "",
        email: "",
        organization: "",
        reason: "other",
        message: "Dear Obscura Labs Team,\n\nI am writing to request beta access to your platform.\n\nI am interested in becoming a beta tester and would like to request early access to your identity intelligence platform.\n\nThank you for your consideration.\n\nBest regards"
      })
      
      // Scroll to form after a delay to ensure state is updated
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setTimeout(() => {
          document.getElementById('name')?.focus()
        }, 500)
      }, 200)
    }
  }, [searchParams])

  const handleLawEnforcementClick = () => {
    setFormData({
      name: "",
      email: "",
      organization: "",
      reason: "law-enforcement",
      message: "Dear Obscura Labs Team,\n\nI am writing to request access to your platform for law enforcement purposes.\n\nThank you for your consideration.\n\nBest regards"
    })
    
    // Scroll to form
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    
    // Focus on name field after a short delay
    setTimeout(() => {
      document.getElementById('name')?.focus()
    }, 500)
  }

  const handleResearchClick = () => {
    setFormData({
      name: "",
      email: "",
      organization: "",
      reason: "research",
      message: "Dear Obscura Labs Team,\n\nI am writing to request access to your platform for academic research purposes.\n\nThank you for your consideration.\n\nBest regards"
    })
    
    // Scroll to form
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    
    // Focus on name field after a short delay
    setTimeout(() => {
      document.getElementById('name')?.focus()
    }, 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      toast({
        title: "Message sent successfully",
        description: "We'll get back to you within 24-48 hours.",
      })
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        organization: "",
        reason: "",
        message: ""
      })
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again or email us directly at contact@obscuralabs.io",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-lg sm:text-xl text-neutral-200 max-w-3xl mx-auto">
            Whether you need enterprise solutions, research access, or have questions about our platform, 
            we're here to help.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 px-4 sm:px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <Card key={index} className="bg-neutral-900/60 border-white/10 hover:border-white/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-white/10 rounded-xl mb-4">
                      {method.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {method.title}
                    </h3>
                    <a 
                      href={`mailto:${method.value}`}
                      className="text-sm text-white/80 hover:text-white transition-colors mb-2"
                    >
                      {method.value}
                    </a>
                    <p className="text-xs text-neutral-400">
                      {method.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section ref={formRef} className="py-16 px-4 sm:px-6 bg-neutral-900/50">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-neutral-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Send us a message</CardTitle>
              <CardDescription className="text-neutral-300">
                Fill out the form below and we'll get back to you within 24-48 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-neutral-800 border-white/10 text-white focus:border-white/30"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-neutral-800 border-white/10 text-white focus:border-white/30"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="organization" className="text-white">
                      Organization
                    </Label>
                    <Input
                      id="organization"
                      name="organization"
                      type="text"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="bg-neutral-800 border-white/10 text-white focus:border-white/30"
                      placeholder="Company or Agency Name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-white">
                      Reason for Contact *
                    </Label>
                    <Select
                      value={selectValue}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, reason: value }))
                      }}
                      required
                    >
                      <SelectTrigger className="bg-neutral-800 border-white/10 text-white focus:border-white/30">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-white/10">
                        {contactReasons.map((reason) => (
                          <SelectItem 
                            key={reason.value} 
                            value={reason.value}
                            className="text-white hover:bg-white/10"
                          >
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className="bg-neutral-800 border-white/10 text-white focus:border-white/30 min-h-[150px]"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="bg-white text-black hover:bg-neutral-200 transition-all duration-300 group"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Special Access Section */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-neutral-900/60 border-white/10 flex flex-col h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-6 w-6 text-white" />
                  <CardTitle className="text-xl text-white">Law Enforcement Access</CardTitle>
                </div>
                <CardDescription className="text-neutral-300">
                  Free access for verified agencies
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-neutral-200 mb-4">
                  We provide complimentary access to verified law enforcement agencies for investigative purposes. 
                  Access will be provided after a brief video or phone call to verify your credentials. Please use your agency email address when contacting us.
                </p>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 mt-auto"
                  onClick={handleLawEnforcementClick}
                >
                  Apply for Law Enforcement Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/60 border-white/10 flex flex-col h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6 text-white" />
                  <CardTitle className="text-xl text-white">Research Partnership</CardTitle>
                </div>
                <CardDescription className="text-neutral-300">
                  Free access for independent researchers and academic institutions
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-neutral-200 mb-4">
                  Academic researchers and institutions can apply for free access to our platform for 
                  cybersecurity research. Please include your institutional affiliation and research proposal.
                </p>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 mt-auto"
                  onClick={handleResearchClick}
                >
                  Apply for Research Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <ContactPageContent />
    </Suspense>
  )
}
