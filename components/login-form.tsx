"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Shield } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast({
        title: "ACCESS GRANTED",
        description: "Authentication successful. Redirecting to command center.",
      })
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login form error:", error)
      toast({
        title: "ACCESS DENIED",
        description: error.message || "Invalid credentials. Please verify your authorization.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="tactical-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-primary tracking-wider">SECURE ACCESS</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-muted-foreground tracking-wider">
            EMAIL
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="user@obscuralabs.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="tactical-input font-mono"
            required
          />
        </div>
        <Button type="submit" className="w-full tactical-button font-mono tracking-wider" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AUTHENTICATING...
            </>
          ) : (
            "INITIATE ACCESS"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-primary/20">
        <p className="text-xs text-muted-foreground text-center font-mono">
          CLASSIFIED SYSTEM - AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </div>
  )
}
