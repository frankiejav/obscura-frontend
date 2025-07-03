import type React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

async function getUser() {
  const token = cookies().get("token")?.value

  if (!token) {
    return null
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (!res.ok) return null

    return res.json()
  } catch (error) {
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
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <DashboardSidebar user={userData.user} />
      <div className="flex flex-col flex-1">
        <DashboardHeader user={userData.user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
