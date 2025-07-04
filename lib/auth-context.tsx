"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  email: string
  name: string
  role: "admin" | "client"
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: { name: string; email: string; password: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const router = useRouter()

  const checkAuth = async () => {
    if (isCheckingAuth) return

    setIsCheckingAuth(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setUser(null)
        setIsLoading(false)
        setIsCheckingAuth(false)
        return
      }

      const response = await fetch("/api/auth/verify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        localStorage.removeItem("token")
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("token")
      setUser(null)
    } finally {
      setIsLoading(false)
      setIsCheckingAuth(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      localStorage.setItem("token", data.token)
      setUser(data.user)

      console.log("Login successful, redirecting to dashboard...")
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const signup = async (signupData: { name: string; email: string; password: string }) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Signup failed")
      }

      localStorage.setItem("token", data.token)
      setUser(data.user)

      console.log("Signup successful, redirecting to dashboard...")
      router.push("/dashboard")
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
