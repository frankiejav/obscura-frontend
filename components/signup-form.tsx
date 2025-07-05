"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus } from "lucide-react"

export function SignupForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const { signup, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    try {
      await signup(email, password, "client")
      // Navigation is handled in the auth context
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
    }
  }

  return (
    <Card className="w-full max-w-md bg-card/95 backdrop-blur border-border/50">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <UserPlus className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-mono tracking-wider">ACCOUNT CREATION</CardTitle>
        </div>
        <CardDescription className="font-mono text-sm tracking-wide">
          REGISTER FOR CLIENT ACCESS CLEARANCE
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-mono text-sm tracking-wider">
              FULL NAME
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Agent Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-mono bg-background/50 border-border/50 focus:border-primary"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono text-sm tracking-wider">
              EMAIL
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="agent@obscuralabs.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="font-mono bg-background/50 border-border/50 focus:border-primary"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-mono text-sm tracking-wider">
              PASSWORD
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="font-mono bg-background/50 border-border/50 focus:border-primary"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-mono text-sm tracking-wider">
              CONFIRM PASSWORD
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="font-mono bg-background/50 border-border/50 focus:border-primary"
              disabled={isLoading}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
              <AlertDescription className="font-mono text-sm">{error}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            className="w-full font-mono tracking-wider bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                CREATING ACCOUNT...
              </>
            ) : (
              "REQUEST ACCESS"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
