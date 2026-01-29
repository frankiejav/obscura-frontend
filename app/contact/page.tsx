"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

function BlueprintIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      {icon === "envelope" && (
        <path d="M0 3.06v9.88L4.94 8 0 3.06zM14.94 2H1.06L8 6.94 14.94 2zm-6.41 6.53c-.14.13-.32.19-.53.19s-.39-.06-.53-.19L1.31 3l5.88 5.88-.07-.35h1.76l-.07.35L14.69 3l-6.16 5.53zM5.65 8.71 1 13h14l-4.65-4.29-1.76 1.58c-.14.13-.36.24-.59.24s-.45-.11-.59-.24L5.65 8.71zM11.06 8 16 12.94V3.06L11.06 8z" fillRule="evenodd" />
      )}
      {icon === "shield" && (
        <path d="M8 0l7 3v4c0 3.53-2.61 6.74-7 8-4.39-1.26-7-4.47-7-8V3l7-3zm0 1.11L2 3.72V7c0 2.89 2.2 5.55 6 6.72 3.8-1.17 6-3.83 6-6.72V3.72L8 1.11z" fillRule="evenodd" />
      )}
      {icon === "people" && (
        <path d="M13.69 10.43c-.79-.49-1.97-.97-3.41-1.32.7-.51 1.2-1.36 1.34-2.35.02-.1.03-.21.03-.32v-.38a2.34 2.34 0 0 0-.2-.95 2.02 2.02 0 0 0-.56-.75 2.49 2.49 0 0 0-.85-.49A3.02 3.02 0 0 0 9 4a3.02 3.02 0 0 0-1.04.17c-.32.1-.61.27-.85.49-.24.22-.43.47-.56.75-.13.29-.2.61-.2.95v.38c0 .11.01.21.03.32.14.99.64 1.84 1.34 2.35-1.44.35-2.62.83-3.41 1.32C3.49 11 3 11.67 3 12.4c0 .53.31.99.75 1.21.47.23 1.02.39 1.61.39h5.28c.59 0 1.14-.16 1.61-.39.44-.22.75-.68.75-1.21 0-.73-.49-1.4-1.31-1.97z" fillRule="evenodd" />
      )}
      {icon === "office" && (
        <path d="M15 15v-1H1v1h14zM7 2h2v1H7V2zm0 2h2v1H7V4zm0 2h2v1H7V6zM3 2h2v1H3V2zm0 2h2v1H3V4zm0 2h2v1H3V6zm0 2h2v1H3V8zm0 2h2v1H3v-1zm8-8h2v1h-2V2zm0 2h2v1h-2V4zm0 2h2v1h-2V6zm0 2h2v1h-2V8zm0 2h2v1h-2v-1zm2 3H9v-3h2v3h2zM14 0H2c-.55 0-1 .45-1 1v12h2V1h10v12h2V1c0-.55-.45-1-1-1z" fillRule="evenodd" />
      )}
      {icon === "arrow-top-right" && (
        <path d="M5 3h8v8l-1-1V4.41L4.41 12l-.7-.71L11.29 4H6L5 3z" fillRule="evenodd" />
      )}
      {icon === "send-message" && (
        <path d="M15.35.65a.79.79 0 0 0-.85-.18L.63 5.53a.77.77 0 0 0-.51.69.76.76 0 0 0 .43.73l4.67 2.33 1.17 4.67a.78.78 0 0 0 .57.54.74.74 0 0 0 .73-.27l2.06-2.47 3.67 1.83a.79.79 0 0 0 .35.08.83.83 0 0 0 .33-.07.77.77 0 0 0 .43-.56l1.82-12.2a.78.78 0 0 0-.17-.65zM5.82 8.48l-3.54-1.77L12.65 2.5 5.82 8.48zm1.54 3.71-.75-2.98 4.23-3.92-3.48 6.9z" fillRule="evenodd" />
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
  { icon: "envelope", title: "General", value: "contact@obscuralabs.io" },
  { icon: "shield", title: "Law Enforcement", value: "law-enforcement@obscuralabs.io" },
  { icon: "people", title: "Research", value: "research@obscuralabs.io" },
  { icon: "office", title: "Enterprise", value: "sales@obscuralabs.io" }
]

function ContactPageContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const formRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    reason: "",
    message: ""
  })
  
  const selectValue = formData.reason === "" ? undefined : formData.reason

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => {
        document.getElementById('name')?.focus()
      }, 500)
    }, 100)
  }

  useEffect(() => {
    const reason = searchParams.get('reason')
    if (reason === 'beta') {
      setFormData({
        name: "",
        email: "",
        organization: "",
        reason: "other",
        message: "I am writing to request beta access to your platform."
      })
      scrollToForm()
    }
  }, [searchParams])

  const handleLawEnforcementClick = () => {
    setFormData({
      name: "",
      email: "",
      organization: "",
      reason: "law-enforcement",
      message: "I am writing to request access to your platform for law enforcement purposes."
    })
    scrollToForm()
  }

  const handleResearchClick = () => {
    setFormData({
      name: "",
      email: "",
      organization: "",
      reason: "research",
      message: "I am writing to request access to your platform for academic research purposes."
    })
    scrollToForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      toast({
        title: "Message sent",
        description: "We'll get back to you within 24-48 hours.",
      })
      
      setFormData({ name: "", email: "", organization: "", reason: "", message: "" })
    } catch {
      toast({
        title: "Error",
        description: "Please try again or email us directly.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

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
              CONTACT
            </motion.p>
            <motion.h1 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[32px] sm:text-[40px] lg:text-[52px] font-light text-[#1c1c1c] leading-[1.08] tracking-[-0.03em] mb-5"
            >
              Get in touch
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[#5a5a5a] text-base sm:text-lg max-w-xl"
            >
              Enterprise solutions, research access, or questions about our platform.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#dee2e6] rounded-lg overflow-hidden">
            {contactMethods.map((method, index) => (
              <motion.a
                key={index}
                href={`mailto:${method.value}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                className="bg-[#ffffff] p-6 lg:p-8 group hover:bg-[#fafafa] transition-colors"
              >
                <BlueprintIcon icon={method.icon} size={16} className="text-[#adb5bd] mb-4 group-hover:text-[#e07a4a] transition-colors" />
                <h3 className="text-sm font-medium text-[#1c1c1c] mb-1">{method.title}</h3>
                <p className="text-xs text-[#adb5bd] truncate">{method.value}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <section ref={formRef} className="py-16 lg:py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
              className="bg-[#ffffff] border border-[#e9ecef] rounded-lg p-8 lg:p-10"
            >
              <div className="mb-8">
                <h2 className="text-[24px] sm:text-[28px] font-light text-[#1c1c1c] mb-2">Send a message</h2>
                <p className="text-[#868e96] text-sm">
                  We'll respond within 24-48 hours.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#5a5a5a] text-sm">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pltr-input"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#5a5a5a] text-sm">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pltr-input"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="organization" className="text-[#5a5a5a] text-sm">Organization</Label>
                    <Input
                      id="organization"
                      name="organization"
                      type="text"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="pltr-input"
                      placeholder="Company name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-[#5a5a5a] text-sm">Reason *</Label>
                    <Select
                      value={selectValue}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
                      required
                    >
                      <SelectTrigger className="pltr-input">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#e9ecef] rounded">
                        {contactReasons.map((reason) => (
                          <SelectItem 
                            key={reason.value} 
                            value={reason.value}
                            className="text-[#1c1c1c] hover:bg-[#f7f6f3] focus:bg-[#f7f6f3]"
                          >
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-[#5a5a5a] text-sm">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className="pltr-input min-h-[140px] resize-none"
                    placeholder="How can we help?"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="pltr-btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : (
                    <>
                      Send Message
                      <BlueprintIcon icon="send-message" size={14} />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
                className="bg-[#ffffff] border border-[#e9ecef] rounded-lg p-8 lg:p-10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BlueprintIcon icon="shield" size={16} className="text-[#e07a4a]" />
                  <h3 className="text-lg font-medium text-[#1c1c1c]">Law Enforcement</h3>
                </div>
                <p className="text-[#868e96] text-sm mb-6 leading-relaxed">
                  We provide complimentary access to verified law enforcement agencies for investigative purposes.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLawEnforcementClick}
                  className="pltr-btn-secondary w-full py-3 text-sm flex items-center justify-center gap-2"
                >
                  Apply for Access
                  <BlueprintIcon icon="arrow-top-right" size={14} />
                </motion.button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                className="bg-[#ffffff] border border-[#e9ecef] rounded-lg p-8 lg:p-10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BlueprintIcon icon="people" size={16} className="text-[#e07a4a]" />
                  <h3 className="text-lg font-medium text-[#1c1c1c]">Research</h3>
                </div>
                <p className="text-[#868e96] text-sm mb-6 leading-relaxed">
                  Academic researchers can apply for free access to our platform for cybersecurity research.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResearchClick}
                  className="pltr-btn-secondary w-full py-3 text-sm flex items-center justify-center gap-2"
                >
                  Apply for Access
                  <BlueprintIcon icon="arrow-top-right" size={14} />
                </motion.button>
              </motion.div>
            </div>
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
      <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border border-[#e9ecef] rounded" />
          <div className="absolute inset-0 border border-transparent border-t-[#e07a4a] rounded animate-spin" />
        </div>
      </div>
    }>
      <ContactPageContent />
    </Suspense>
  )
}
