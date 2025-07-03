import type { Metadata } from "next"
import { SearchInterface } from "@/components/dashboard/search-interface"

export const metadata: Metadata = {
  title: "Search | Obscura Labs",
  description: "Search data securely with Obscura Labs platform",
}

export default function SearchPage() {
  return <SearchInterface />
}
