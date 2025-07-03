import type { Metadata } from "next"
import { DashboardOverview } from "@/components/dashboard/overview"

export const metadata: Metadata = {
  title: "Dashboard | Obscura Labs",
  description: "Dashboard overview for Obscura Labs secure data platform",
}

export default function DashboardPage() {
  return <DashboardOverview />
}
