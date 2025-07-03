import type { Metadata } from "next"
import { DataManagement } from "@/components/dashboard/data-management"

export const metadata: Metadata = {
  title: "Data Management | Obscura Labs",
  description: "Manage and explore data in the Obscura Labs platform",
}

export default function DataPage() {
  return <DataManagement />
}
