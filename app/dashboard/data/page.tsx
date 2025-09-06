import type { Metadata } from "next"
import { Monitoring } from "@/components/dashboard/monitoring"

export const metadata: Metadata = {
  title: "Monitoring | Obscura Labs",
  description: "Monitor emails, domains, and phone numbers for data breaches",
}

export default function DataPage() {
  return <Monitoring />
}
