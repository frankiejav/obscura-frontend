"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, UserPlus } from "lucide-react"

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "VALIDATION ERROR",
        description: "Passwords do not match. Please verify your entries.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      toast({
        title: "SECURITY REQUIREMENT",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      toast({
        title: "ACCOUNT CREATED",
        description: "Registration successful. Access granted to command center.",
      })
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Signup form error:", error)
      toast({
        title: "REGISTRATION FAILED",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="tactical-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-primary tracking-wider">CREATE ACCOUNT</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-muted-foreground tracking-wider">
            FULL NAME
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="tactical-input font-mono"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-muted-foreground tracking-wider">
            EMAIL
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="user@obscuralabs.io"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="tactical-input font-mono"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-muted-foreground tracking-wider">
            PASSWORD
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="tactical-input font-mono"
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-muted-foreground tracking-wider">
            CONFIRM PASSWORD
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            className="tactical-input font-mono"
            required
            minLength={8}
          />
        </div>

        <Button type="submit" className="w-full tactical-button font-mono tracking-wider" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              CREATING ACCOUNT...
            </>
          ) : (
            "ESTABLISH ACCESS"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-primary/20">
        <p className="text-xs text-muted-foreground text-center font-mono">
          PRIVATE SYSTEM - AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </div>
  )
}
