"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BarChart3, Database, Home, LogOut, Search, Settings, Users } from "lucide-react"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

type User = {
  id: string
  email: string
  name: string
  role: "admin" | "client"
}

export function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const isAdmin = user?.role === "admin"

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="border-r border-primary/20">
        <SidebarHeader className="flex items-center px-4 py-6 border-b border-primary/20">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/images/obscura-logo-white.png" alt="Obscura" width={48} height={48} className="opacity-90" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground tracking-wider">v2.1.7 CLASSIFIED</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
          <div className="mb-4 px-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="status-indicator status-active"></div>
              <span>SYSTEM ONLINE</span>
            </div>
          </div>

          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard"}
                className="tactical-button justify-start gap-3 h-10"
              >
                <Link href="/dashboard">
                  <Home className="h-4 w-4" />
                  <span className="font-mono tracking-wider">COMMAND CENTER</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard/search"}
                className="tactical-button justify-start gap-3 h-10"
              >
                <Link href="/dashboard/search">
                  <Search className="h-4 w-4" />
                  <span className="font-mono tracking-wider">INTEL SEARCH</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard/data"}
                className="tactical-button justify-start gap-3 h-10"
              >
                <Link href="/dashboard/data">
                  <Database className="h-4 w-4" />
                  <span className="font-mono tracking-wider">DATA VAULT</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard/analytics"}
                className="tactical-button justify-start gap-3 h-10"
              >
                <Link href="/dashboard/analytics">
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-mono tracking-wider">ANALYTICS</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/users"}
                  className="tactical-button justify-start gap-3 h-10"
                >
                  <Link href="/dashboard/users">
                    <Users className="h-4 w-4" />
                    <span className="font-mono tracking-wider">AGENT NETWORK</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard/settings"}
                className="tactical-button justify-start gap-3 h-10"
              >
                <Link href="/dashboard/settings">
                  <Settings className="h-4 w-4" />
                  <span className="font-mono tracking-wider">SYSTEMS</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-primary/20 p-4">
          <div className="mb-3 text-xs text-muted-foreground space-y-1">
            <div>UPTIME: 72:14:33</div>
            <div>AGENTS: 847 ACTIVE</div>
            <div>MISSIONS: 23 ONGOING</div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={logout}
                className="tactical-button justify-start gap-3 h-10 text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-mono tracking-wider">DISCONNECT</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

export { DashboardSidebar as Sidebar }
