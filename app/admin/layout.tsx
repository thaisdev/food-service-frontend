import { ReactNode } from "react"

import { SessionAccessGuard } from "@/components/session-access-guard"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <SessionAccessGuard module="admin">{children}</SessionAccessGuard>
}
