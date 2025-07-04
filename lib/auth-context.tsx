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

type SignupData = {
  name: string
  email: string
  password: string
  // role removed - always defaults to client
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setIsLoading(false)
          return
        }

        // Verify token with the server
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem("token")
          localStorage.removeItem("refreshToken")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Set up token refresh interval
  useEffect(() => {
    if (!user) return

    const refreshInterval = setInterval(
      () => {
        refreshToken().catch(console.error)
      },
      15 * 60 * 1000,
    ) // Refresh every 15 minutes

    return () => clearInterval(refreshInterval)
  }, [user])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log("Attempting login with:", { email, password }) // Debug log

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("Login response status:", response.status) // Debug log

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Login failed:", errorData) // Debug log
        throw new Error(errorData.error || "Login failed")
      }

      const data = await response.json()
      console.log("Login successful, received data:", data) // Debug log

      localStorage.setItem("token", data.token)
      localStorage.setItem("refreshToken", data.refreshToken)
      setUser(data.user)

      // Redirect to dashboard after successful login
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (signupData: SignupData) => {
    setIsLoading(true)
    try {
      console.log("Attempting signup with:", signupData) // Debug log

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      })

      console.log("Signup response status:", response.status) // Debug log

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Signup failed:", errorData) // Debug log
        throw new Error(errorData.error || "Signup failed")
      }

      const data = await response.json()
      console.log("Signup successful, received data:", data) // Debug log

      localStorage.setItem("token", data.token)
      localStorage.setItem("refreshToken", data.refreshToken)
      setUser(data.user)

      // Redirect to dashboard after successful signup
      router.push("/dashboard")
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) throw new Error("No refresh token")

    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) throw new Error("Token refresh failed")

    const data = await response.json()
    localStorage.setItem("token", data.token)
    localStorage.setItem("refreshToken", data.refreshToken)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    setUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
