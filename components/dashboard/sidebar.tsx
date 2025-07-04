"use client"

import { Home, Search, Database, Users, Settings, Activity, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
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
    clearance_level: number
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

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <Sidebar className="border-r border-orange-500/20 bg-black/90">
      <SidebarHeader className="border-b border-orange-500/20 p-4">
        <div className="flex items-center gap-3">
          <div className="tactical-border p-2 bg-orange-500/10">
            <Image src="/images/obscura-logo-white.png" alt="Obscura Labs" width={32} height={32} className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-orange-500 font-mono text-sm font-bold tracking-wider">OBSCURA LABS</h2>
            <p className="text-gray-400 font-mono text-xs">CLASSIFIED SYSTEM</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-500/70 font-mono text-xs tracking-wider">
            NAVIGATION
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="font-mono text-sm hover:bg-orange-500/10 hover:text-orange-500 data-[active=true]:bg-orange-500/20 data-[active=true]:text-orange-500"
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

        <SidebarSeparator className="bg-orange-500/20" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-orange-500/70 font-mono text-xs tracking-wider">
            SYSTEM STATUS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">CLEARANCE</span>
                <span className="text-orange-500">LEVEL {user.clearance_level}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">ROLE</span>
                <span className="text-orange-500">{user.role.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <Activity className="w-3 h-3 text-green-500" />
                <span className="text-green-500">SYSTEM ONLINE</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-orange-500/20 p-4">
        <div className="space-y-3">
          <div className="text-xs font-mono text-gray-400">
            <div>USER: {user.email}</div>
            <div>SESSION: ACTIVE</div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full font-mono text-xs border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500 bg-transparent"
          >
            <LogOut className="w-3 h-3 mr-2" />
            LOGOUT
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
