"use client"

import { Home, Search, Users, Settings, LogOut, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
    sub?: string
    email?: string
    name?: string
    picture?: string
    [key: string]: any
  }
}

const navigationItems: Array<{
  title: string
  url: string
  icon: any
  roles: string[]
  external?: boolean
}> = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Home,
    roles: ["admin", "client"],
  },
  {
    title: "Search",
    url: "/dashboard/search",
    icon: Search,
    roles: ["admin", "client"],
  },
  {
    title: "Monitoring",
    url: "/dashboard/monitoring",
    icon: Shield,
    roles: ["admin", "client"],
  },
  {
    title: "User Management",
    url: "/dashboard/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    roles: ["admin", "client"],
  },
  {
    title: "API",
    url: "https://docs.obscuralabs.io/api",
    icon: Zap,
    roles: ["admin", "client"],
    external: true,
  },
]

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    router.push("/auth/logout")
  }

  // Filter navigation items based on user role
  // For Auth0 users, default to 'client' role if no role is specified
  const userRole = user.role || user['https://obscuralabs.io/role'] || 'client'
  const filteredNavigationItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <Sidebar className="border-r border-white/20 bg-black/90">
      <SidebarHeader className="border-b border-white/20 p-4">
        <div className="flex items-center gap-3">
          <Image src="/images/symbolwhite.png" alt="Obscura Labs" width={48} height={48} className="w-12 h-12" />
          <div>
            <h2 className="text-white font-mono text-sm font-bold tracking-wider">OBSCURA LABS</h2>
            <p className="text-gray-400 font-mono text-xs">PRIVATE SYSTEM</p>
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
              {filteredNavigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="font-mono text-sm hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white"
                  >
                    {item.external ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    ) : (
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/20 p-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full font-mono text-xs border-white/30 text-white hover:bg-white/10 hover:border-white bg-transparent"
        >
          <LogOut className="w-3 h-3 mr-2" />
          LOGOUT
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
