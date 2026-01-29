"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { BlueprintIcon } from "@/components/ui/blueprint-icon"

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
  icon: string
  roles: string[]
  external?: boolean
}> = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: "home",
    roles: ["admin", "client"],
  },
  {
    title: "Search",
    url: "/dashboard/search",
    icon: "search",
    roles: ["admin", "client"],
  },
  {
    title: "Monitoring",
    url: "/dashboard/monitoring",
    icon: "shield",
    roles: ["admin", "client"],
  },
  {
    title: "User Management",
    url: "/dashboard/users",
    icon: "people",
    roles: ["admin"],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: "cog",
    roles: ["admin", "client"],
  },
  {
    title: "API",
    url: "https://docs.obscuralabs.io/api",
    icon: "lightning",
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
  const userRole = user.role || user['https://obscuralabs.io/role'] || 'client'
  const filteredNavigationItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <Sidebar className="border-r border-[#e9ecef] bg-white">
      <SidebarHeader className="border-b border-[#e9ecef] p-5">
        <div className="flex items-center gap-3">
          <Image src="/images/symbol.svg" alt="Obscura Labs" width={40} height={40} className="w-10 h-10" />
          <div>
            <h2 className="text-[#1c1c1c] text-sm font-semibold tracking-[-0.01em]">Obscura Labs</h2>
            <p className="text-[#adb5bd] text-xs">Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#e07a4a] text-[10px] font-semibold tracking-[0.1em] uppercase px-3 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="text-[#5a5a5a] text-sm font-medium hover:bg-[#f7f6f3] hover:text-[#1c1c1c] data-[active=true]:bg-[#f7f6f3] data-[active=true]:text-[#1c1c1c] data-[active=true]:border-l-2 data-[active=true]:border-[#e07a4a] rounded-md transition-all duration-200"
                  >
                    {item.external ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2">
                        <BlueprintIcon icon={item.icon} size={16} className="text-[#868e96]" />
                        <span>{item.title}</span>
                      </a>
                    ) : (
                      <Link href={item.url} className="flex items-center gap-3 px-3 py-2">
                        <BlueprintIcon icon={item.icon} size={16} className="text-[#868e96]" />
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

      <SidebarFooter className="border-t border-[#e9ecef] p-4">
        <div className="mb-3 px-2">
          <p className="text-xs text-[#868e96] truncate">{user.email}</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full text-sm font-medium border-[#dee2e6] text-[#5a5a5a] hover:bg-[#f7f6f3] hover:text-[#1c1c1c] hover:border-[#e07a4a] bg-transparent transition-all duration-200"
        >
          <BlueprintIcon icon="log-out" size={14} className="mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
