"use client"

import { User, Shield } from "lucide-react"
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
    sub?: string
    email?: string
    name?: string
    picture?: string
    [key: string]: any
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const userRole = user.role || user['https://obscuralabs.io/role'] || 'client'
  const userId = user.sub || user.id || 'unknown'
  const shouldShowClearance = userRole === "ADMIN" || userRole === "Client"
  const { createNotification } = useNotifications(userId)

  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-black/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:bg-white/10" />
        </div>

        <div className="flex items-center gap-4">
          {shouldShowClearance && (
            <Badge variant="outline" className="border-white/30 text-white font-mono text-xs">
              CLEARANCE: L{user.clearance_level}
            </Badge>
          )}

          <NotificationsPanel user={user} />
          
          {userRole === "ADMIN" && (
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
                Role: {userRole.toUpperCase()}
              </DropdownMenuItem>
              {shouldShowClearance && (
                <DropdownMenuItem className="font-mono text-xs hover:bg-white/10">
                  <Shield className="w-3 h-3 mr-2" />
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
