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
      <div className="min-h-screen bg-black tactical-grid flex items-center justify-center">
        <div className="tactical-card p-8 max-w-md">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="status-indicator status-processing"></div>
              <p className="text-primary font-mono tracking-wider text-sm">AUTHENTICATING...</p>
            </div>
            <p className="text-muted-foreground font-mono text-xs">
              VERIFYING CREDENTIALS
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black tactical-grid flex items-center justify-center">
        <div className="tactical-card p-8 max-w-md">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="status-indicator status-processing"></div>
              <p className="text-primary font-mono tracking-wider text-sm">REDIRECTING TO LOGIN...</p>
            </div>
            <p className="text-muted-foreground font-mono text-xs">
              INITIALIZING SECURE ACCESS
            </p>
          </div>
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
