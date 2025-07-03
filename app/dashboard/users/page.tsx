import type { Metadata } from "next"
import { UserManagement } from "@/components/dashboard/user-management"

export const metadata: Metadata = {
  title: "User Management | Obscura Labs",
  description: "Manage users and permissions for Obscura Labs platform",
}

export default function UsersPage() {
  return <UserManagement />
}
