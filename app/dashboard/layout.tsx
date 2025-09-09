import type React from "react"
import { auth0 } from "@/lib/auth0"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the session on the server
  const session = await auth0.getSession()
  
  // If no session, redirect to login
  if (!session) {
    redirect("/auth/login?returnTo=/dashboard")
  }

  const user = session.user

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