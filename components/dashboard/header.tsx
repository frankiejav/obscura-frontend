"use client"

import { Button } from "@/components/ui/button"
import { BlueprintIcon } from "@/components/ui/blueprint-icon"
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
    <header className="sticky top-0 z-40 border-b border-[#e9ecef] bg-white/95 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-[#5a5a5a] hover:bg-[#f7f6f3] hover:text-[#1c1c1c] transition-colors" />
        </div>

        <div className="flex items-center gap-3">
          {shouldShowClearance && (
            <Badge variant="outline" className="border-[#dee2e6] text-[#868e96] text-xs font-medium bg-[#f7f6f3]">
              Level {user.clearance_level}
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
              <Button variant="ghost" size="icon" className="text-[#5a5a5a] hover:bg-[#f7f6f3] hover:text-[#1c1c1c]">
                <BlueprintIcon icon="user" size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-[#e9ecef] shadow-lg">
              <DropdownMenuLabel className="text-xs text-[#e07a4a] font-semibold tracking-wide uppercase">Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#e9ecef]" />
              <DropdownMenuItem className="text-sm text-[#5a5a5a] hover:bg-[#f7f6f3] hover:text-[#1c1c1c] cursor-pointer">
                <BlueprintIcon icon="user" size={14} className="mr-2 text-[#868e96]" />
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm text-[#5a5a5a] hover:bg-[#f7f6f3] hover:text-[#1c1c1c] cursor-pointer">
                <BlueprintIcon icon="shield" size={14} className="mr-2 text-[#868e96]" />
                Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </DropdownMenuItem>
              {shouldShowClearance && (
                <DropdownMenuItem className="text-sm text-[#5a5a5a] hover:bg-[#f7f6f3] hover:text-[#1c1c1c] cursor-pointer">
                  <BlueprintIcon icon="key" size={14} className="mr-2 text-[#868e96]" />
                  Clearance: Level {user.clearance_level}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
