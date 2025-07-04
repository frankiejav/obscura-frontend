"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, UserIcon, SettingsIcon, LogOutIcon, Activity } from "lucide-react"

type DashboardUser = {
  id: string
  email: string
  name: string
  role: "admin" | "client"
}

export function DashboardHeader({ user }: { user: DashboardUser }) {
  const { logout } = useAuth()
  const [notifications, setNotifications] = useState(3)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const time = new Date()
        .toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(",", "")
      setCurrentTime(time)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-2 sm:gap-4 border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 lg:px-6">
      <SidebarTrigger className="tactical-button" />

      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-mono">
        <span className="text-primary tracking-wider hidden sm:inline">COMMAND CENTER</span>
        <span className="text-primary tracking-wider sm:hidden">DASHBOARD</span>
        <span className="text-muted-foreground hidden sm:inline">/</span>
        <span className="text-primary tracking-wider hidden sm:inline">OVERVIEW</span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-muted-foreground">
          <span>LAST UPDATE: {currentTime} UTC</span>
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3" />
            <span>ACTIVE</span>
          </div>
        </div>
        <div className="hidden sm:flex lg:hidden items-center gap-2 text-xs font-mono text-muted-foreground">
          <span>{currentTime.split(' ')[1]}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative tactical-button bg-transparent"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-mono">
                  {notifications}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="tactical-card border-primary/20">
            <DropdownMenuLabel className="font-mono tracking-wider text-primary">ALERTS</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem className="font-mono text-sm">
              <div className="flex items-center gap-2">
                <div className="status-indicator status-active"></div>
                New intel available
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-mono text-sm">
              <div className="flex items-center gap-2">
                <div className="status-indicator status-processing"></div>
                System update completed
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-mono text-sm">
              <div className="flex items-center gap-2">
                <div className="status-indicator status-error"></div>
                Security alert
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem onClick={() => setNotifications(0)} className="text-center font-mono text-primary">
              CLEAR ALL
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full tactical-button" aria-label="User menu">
              <Avatar className="h-8 w-8 border border-primary/30">
                <AvatarFallback className="bg-primary/10 text-primary font-mono text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="tactical-card border-primary/20">
            <DropdownMenuLabel className="font-mono">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-primary tracking-wider">
                  AGENT {getInitials(user.name)}
                </p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                <p className="text-xs leading-none text-muted-foreground">CLEARANCE: {user.role.toUpperCase()}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem className="font-mono">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>PROFILE</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-mono">
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>SETTINGS</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem onClick={logout} className="font-mono text-destructive">
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>DISCONNECT</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
