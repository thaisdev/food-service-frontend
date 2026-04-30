import { ReactNode } from "react"

import { SessionAccessGuard } from "@/components/session-access-guard"

export default function CustomersLayout({ children }: { children: ReactNode }) {
  return <SessionAccessGuard module="customers">{children}</SessionAccessGuard>
}
