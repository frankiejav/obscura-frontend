"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("Dashboard layout - user:", user, "isLoading:", isLoading)
    if (!isLoading && !user) {
      console.log("No user found, redirecting to login...")
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="tactical-grid w-16 h-16 mx-auto mb-4 animate-pulse border border-orange-500/30"></div>
          <p className="text-orange-500 font-mono tracking-wider text-sm">AUTHENTICATING...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="tactical-grid w-16 h-16 mx-auto mb-4 animate-pulse border border-orange-500/30"></div>
          <p className="text-orange-500 font-mono tracking-wider text-sm">REDIRECTING TO LOGIN...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black tactical-grid">
      <SidebarProvider>
        <DashboardSidebar user={user} />
        <SidebarInset>
          <DashboardHeader user={user} />
          <main className="flex-1 overflow-auto p-6 bg-black/50">
            <div className="tactical-border p-6 bg-black/80">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
