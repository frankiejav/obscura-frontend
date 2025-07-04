import type React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ConnectionTracker } from "@/components/dashboard/connection-tracker"

async function getUser() {
  const token = (await cookies()).get("token")?.value

  console.log("Dashboard layout - Token found:", !!token)
  
  if (!token) {
    console.log("Dashboard layout - No token, redirecting")
    return null
  }

  try {
    console.log("Dashboard layout - Verifying token...")
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    console.log("Dashboard layout - Verify response status:", res.status)

    if (!res.ok) {
      console.log("Dashboard layout - Verify failed, redirecting")
      return null
    }

    const data = await res.json()
    console.log("Dashboard layout - User verified:", data.user?.email)
    return data
  } catch (error) {
    console.error("Dashboard layout - Error:", error)
    return null
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userData = await getUser()

  if (!userData) {
    redirect("/")
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full flex-col lg:flex-row lg:overflow-hidden">
        <DashboardSidebar user={userData.user} />
        <div className="flex flex-col flex-1 min-w-0">
          <DashboardHeader user={userData.user} />
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">{children}</main>
        </div>
      </div>
      <ConnectionTracker />
    </SidebarProvider>
  )
}
