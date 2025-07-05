"use client"

import type { Metadata } from "next"
import { SettingsPage } from "@/components/dashboard/settings"
import { useAuth } from "@/lib/auth-context"

export const metadata: Metadata = {
  title: "Settings | Obscura Labs",
  description: "Configure your Obscura Labs platform settings",
}

export default function Settings() {
  const { user } = useAuth()
  return <SettingsPage user={user} />
}
