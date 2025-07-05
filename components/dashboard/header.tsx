"use client"

import { User, Shield, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationsPanel } from "./notifications-panel"
import { AdminNotificationForm } from "./admin-notification-form"
import { useNotifications } from "@/hooks/use-notifications"
import { useEffect, useState } from "react"

interface DashboardHeaderProps {
  user: {
    id: string
    email: string
    role: string
    clearance_level: number
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const shouldShowClearance = user.role === "ADMIN" || user.role === "Client"
  const { createNotification } = useNotifications(user.id)
  const [isSecureConnection, setIsSecureConnection] = useState(true)

  useEffect(() => {
    // Check if the connection is secure (HTTPS)
    const checkSecureConnection = () => {
      if (typeof window !== 'undefined') {
        const isSecure = window.location.protocol === 'https:'
        setIsSecureConnection(isSecure)
      }
    }

    checkSecureConnection()
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-black/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:bg-white/10" />
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-white" />
            <div>
              <h1 className="text-white font-mono text-lg font-bold tracking-wider">COMMAND CENTER</h1>
              <p className="text-gray-400 font-mono text-xs">PRIVATE LEAKED DATA ACCESS TERMINAL</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Activity className={`w-3 h-3 ${isSecureConnection ? 'text-green-500' : 'text-red-500'}`} />
            <span className={isSecureConnection ? 'text-green-500' : 'text-red-500'}>
              {isSecureConnection ? 'SECURE CONNECTION' : 'INSECURE CONNECTION'}
            </span>
          </div>

          {shouldShowClearance && (
            <Badge variant="outline" className="border-white/30 text-white font-mono text-xs">
              CLEARANCE: L{user.clearance_level}
            </Badge>
          )}

          <NotificationsPanel user={user} />
          
          {user.role === "ADMIN" && (
            <AdminNotificationForm 
              user={user} 
              onSubmit={createNotification} 
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black/95 border-white/20 text-white">
              <DropdownMenuLabel className="font-mono text-xs text-white">USER PROFILE</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem className="font-mono text-xs hover:bg-white/10">
                <User className="w-3 h-3 mr-2" />
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuItem className="font-mono text-xs hover:bg-white/10">
                <Shield className="w-3 h-3 mr-2" />
                Role: {user.role.toUpperCase()}
              </DropdownMenuItem>
              {shouldShowClearance && (
                <DropdownMenuItem className="font-mono text-xs hover:bg-white/10">
                  <Activity className="w-3 h-3 mr-2" />
                  Clearance: {user.clearance_level}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
