"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BarChart3, Database, Home, LogOut, Search, Settings, Users } from "lucide-react"
import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
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
  const [analytics, setAnalytics] = useState<any>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const connectToStream = () => {
      try {
        // Close existing connection if any
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
        }

        // Create new EventSource connection
        const eventSource = new EventSource('/api/dashboard/stream')
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          console.log('Sidebar SSE connection established')
        }

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            if (data.type === 'analytics') {
              setAnalytics(data.data)
            }
          } catch (parseError) {
            console.error('Error parsing SSE data:', parseError)
          }
        }

        eventSource.onerror = (error) => {
          console.error('Sidebar SSE connection error:', error)
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            connectToStream()
          }, 5000)
        }

      } catch (error) {
        console.error('Failed to establish SSE connection:', error)
      }
    }

    // Initial connection
    connectToStream()

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  // Format uptime
  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}:${remainingHours.toString().padStart(2, '0')}:00`
  }

  return (
    <Sidebar className="border-r border-primary/20 w-full lg:w-64">
        <SidebarHeader className="flex items-center px-3 sm:px-4 py-4 sm:py-6 border-b border-primary/20">
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
            <Image src="/images/obscura-logo-white.png" alt="Obscura" width={32} height={32} className="opacity-90 sm:w-12 sm:h-12" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground tracking-wider hidden sm:block">v2.1.7 CLASSIFIED</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
          <div className="mb-4 px-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="status-indicator status-active"></div>
              <span className="hidden sm:inline">SYSTEM ONLINE</span>
              <span className="sm:hidden">ONLINE</span>
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
                  <span className="font-mono tracking-wider hidden sm:inline">COMMAND CENTER</span>
                  <span className="font-mono tracking-wider sm:hidden">DASHBOARD</span>
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
                  <span className="font-mono tracking-wider hidden sm:inline">INTEL SEARCH</span>
                  <span className="font-mono tracking-wider sm:hidden">SEARCH</span>
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
                  <span className="font-mono tracking-wider hidden sm:inline">DATA VAULT</span>
                  <span className="font-mono tracking-wider sm:hidden">DATA</span>
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
                  <span className="font-mono tracking-wider hidden sm:inline">USER NETWORK</span>
                  <span className="font-mono tracking-wider sm:hidden">USERS</span>
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
                  <span className="font-mono tracking-wider hidden sm:inline">SYSTEMS</span>
                  <span className="font-mono tracking-wider sm:hidden">SETTINGS</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-primary/20 p-3 sm:p-4">
          <div className="mb-3 text-xs text-muted-foreground space-y-1">
            <div className="hidden sm:block">UPTIME: {analytics ? formatUptime(analytics.system.uptime) : '00:00:00'}</div>
            <div className="hidden sm:block">USERS: {analytics ? analytics.metrics.activeUsers : '0'} ACTIVE</div>
            <div className="hidden sm:block">INVESTIGATIONS: {analytics ? analytics.metrics.activeQueries : '0'} ONGOING</div>
            <div className="sm:hidden text-center">
              <div>UPTIME: {analytics ? formatUptime(analytics.system.uptime) : '00:00:00'}</div>
              <div>USERS: {analytics ? analytics.metrics.activeUsers : '0'}</div>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={logout}
                className="tactical-button justify-start gap-3 h-10 text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-mono tracking-wider hidden sm:inline">DISCONNECT</span>
                <span className="font-mono tracking-wider sm:hidden">LOGOUT</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
                  </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
