import type { Metadata } from "next"
import { SettingsPage } from "@/components/dashboard/settings"

export const metadata: Metadata = {
  title: "Settings | Obscura Labs",
  description: "Configure your Obscura Labs platform settings",
}

export default function Settings() {
  return <SettingsPage />
}
