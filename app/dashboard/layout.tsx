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
  // Check if Auth0 is configured
  if (!auth0) {
    // Redirect to login if Auth0 is not configured
    redirect("/login")
  }
  
  // Get the session on the server
  const session = await auth0.getSession()
  
  // If no session, redirect to login
  if (!session) {
    redirect("/auth/login?returnTo=/dashboard")
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <SidebarProvider>
        <DashboardSidebar user={user} />
        <SidebarInset>
          <DashboardHeader user={user} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
