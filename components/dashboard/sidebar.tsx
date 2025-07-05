"use client"

import { Home, Search, Database, Users, Settings, Activity, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface DashboardSidebarProps {
  user: {
    id: string
    email: string
    role: string
  }
}

const navigationItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Search",
    url: "/dashboard/search",
    icon: Search,
  },
  {
    title: "Data Management",
    url: "/dashboard/data",
    icon: Database,
  },
  {
    title: "User Management",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [systemStatus, setSystemStatus] = useState<"online" | "offline">("online")

  // Check system status periodically
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch("/api/system/status")
        if (response.ok) {
          const data = await response.json()
          setSystemStatus(data.status)
        } else {
          setSystemStatus("offline")
        }
      } catch (error) {
        console.error("Failed to check system status:", error)
        setSystemStatus("offline")
      }
    }

    // Check immediately
    checkSystemStatus()

    // Check every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <Sidebar className="border-r border-white/20 bg-black/90">
      <SidebarHeader className="border-b border-white/20 p-4">
        <div className="flex items-center gap-3">
          <Image src="/images/symbolwhite.png" alt="Obscura Labs" width={48} height={48} className="w-12 h-12" />
          <div>
            <h2 className="text-white font-mono text-sm font-bold tracking-wider">OBSCURA LABS</h2>
            <p className="text-gray-400 font-mono text-xs">CLASSIFIED SYSTEM</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70 font-mono text-xs tracking-wider">
            NAVIGATION
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="font-mono text-sm hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white"
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-white/20" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70 font-mono text-xs tracking-wider">
            SYSTEM STATUS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">ROLE</span>
                <span className="text-white">{user.role.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <Activity className={`w-3 h-3 ${systemStatus === "online" ? "text-green-500" : "text-red-500"}`} />
                <span className={systemStatus === "online" ? "text-green-500" : "text-red-500"}>
                  SYSTEM {systemStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/20 p-4">
        <div className="space-y-3">
          <div className="text-xs font-mono text-gray-400">
            <div>USER: {user.email}</div>
            <div>SESSION: ACTIVE</div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full font-mono text-xs border-white/30 text-white hover:bg-white/10 hover:border-white bg-transparent"
          >
            <LogOut className="w-3 h-3 mr-2" />
            LOGOUT
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
