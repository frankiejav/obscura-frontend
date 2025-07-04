"use client"

import { Bell, User, Shield, Activity } from "lucide-react"
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

interface DashboardHeaderProps {
  user: {
    id: string
    email: string
    role: string
    clearance_level: number
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-orange-500/20 bg-black/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-orange-500 hover:bg-orange-500/10" />
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-orange-500" />
            <div>
              <h1 className="text-orange-500 font-mono text-lg font-bold tracking-wider">TACTICAL OPERATIONS CENTER</h1>
              <p className="text-gray-400 font-mono text-xs">CLASSIFIED DATA ACCESS TERMINAL</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Activity className="w-3 h-3 text-green-500" />
            <span className="text-green-500">SECURE CONNECTION</span>
          </div>

          <Badge variant="outline" className="border-orange-500/30 text-orange-500 font-mono text-xs">
            CLEARANCE: L{user.clearance_level}
          </Badge>

          <Button variant="ghost" size="icon" className="relative text-orange-500 hover:bg-orange-500/10">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-orange-500 hover:bg-orange-500/10">
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black/90 border-orange-500/20 text-white">
              <DropdownMenuLabel className="font-mono text-xs text-orange-500">AGENT PROFILE</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-orange-500/20" />
              <DropdownMenuItem className="font-mono text-xs hover:bg-orange-500/10">
                <User className="w-3 h-3 mr-2" />
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuItem className="font-mono text-xs hover:bg-orange-500/10">
                <Shield className="w-3 h-3 mr-2" />
                Role: {user.role.toUpperCase()}
              </DropdownMenuItem>
              <DropdownMenuItem className="font-mono text-xs hover:bg-orange-500/10">
                <Activity className="w-3 h-3 mr-2" />
                Clearance: Level {user.clearance_level}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
