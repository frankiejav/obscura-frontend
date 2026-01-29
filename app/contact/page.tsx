"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import Header from "@/components/navigation/header"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

const contactReasons = [
  { value: "beta", label: "Request Beta Access" },
  { value: "enterprise", label: "Enterprise Sales" },
  { value: "research", label: "Research Access" },
  { value: "law-enforcement", label: "Law Enforcement" },
  { value: "support", label: "Support" },
  { value: "other", label: "Other" },
]

function ContactPageContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    reason: "",
    message: ""
  })
  
  const selectValue = formData.reason === "" ? undefined : formData.reason

  useEffect(() => {
    const reason = searchParams.get('reason')
    if (reason === 'beta') {
      setFormData(prev => ({
        ...prev,
        reason: "beta",
        message: "I would like to request beta access to your platform."
      }))
    }
  }, [searchParams])

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
    <div className="min-h-screen bg-[#1c1c1c] flex flex-col">
      <Header variant="dark" />

      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-[#e07a4a] text-[11px] uppercase tracking-[0.2em] mb-4">Contact</p>
            <h1 className="text-[32px] font-light text-white tracking-[-0.02em] leading-tight">
              Get in touch
            </h1>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[#868e96] text-xs">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="bg-transparent border-0 border-b border-[#333] rounded-none text-white placeholder:text-[#4a4a4a] focus:border-[#e07a4a] focus:ring-0 px-0 py-3"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#868e96] text-xs">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="bg-transparent border-0 border-b border-[#333] rounded-none text-white placeholder:text-[#4a4a4a] focus:border-[#e07a4a] focus:ring-0 px-0 py-3"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="organization" className="text-[#868e96] text-xs">Organization</Label>
              <Input
                id="organization"
                name="organization"
                type="text"
                value={formData.organization}
                onChange={handleInputChange}
                className="bg-transparent border-0 border-b border-[#333] rounded-none text-white placeholder:text-[#4a4a4a] focus:border-[#e07a4a] focus:ring-0 px-0 py-3"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-[#868e96] text-xs">Reason</Label>
              <Select
                value={selectValue}
                onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
                required
              >
                <SelectTrigger className="bg-transparent border-0 border-b border-[#333] rounded-none text-white focus:border-[#e07a4a] focus:ring-0 px-0 py-3 h-auto [&>svg]:text-[#868e96]">
                  <SelectValue placeholder="Select" className="text-[#4a4a4a]" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1c1c] border-[#333] rounded">
                  {contactReasons.map((reason) => (
                    <SelectItem 
                      key={reason.value} 
                      value={reason.value}
                      className="text-white hover:bg-[#252525] focus:bg-[#252525] focus:text-white"
                    >
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-[#868e96] text-xs">Message</Label>
              <Textarea
                id="message"
                name="message"
                required
                value={formData.message}
                onChange={handleInputChange}
                className="bg-transparent border-0 border-b border-[#333] rounded-none text-white placeholder:text-[#4a4a4a] focus:border-[#e07a4a] focus:ring-0 px-0 py-3 min-h-[100px] resize-none"
              />
            </div>

            <div className="pt-4">
              <motion.button
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#e07a4a] text-white text-sm font-medium tracking-wide disabled:opacity-50 transition-opacity"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </motion.button>
            </div>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[#4a4a4a] text-xs mt-8"
          >
            Or email{' '}
            <a href="mailto:contact@obscuralabs.io" className="text-[#868e96] hover:text-white transition-colors">
              contact@obscuralabs.io
            </a>
          </motion.p>
        </div>
      </main>
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center">
        <div className="w-5 h-5 border border-[#333] border-t-[#e07a4a] rounded-full animate-spin" />
      </div>
    }>
      <ContactPageContent />
    </Suspense>
  )
}
