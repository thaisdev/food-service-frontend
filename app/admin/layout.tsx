import { ReactNode } from "react"

import { SessionAccessGuard } from "@/components/session-access-guard"
import { SessionModule } from "@/lib/session-access"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SessionAccessGuard module={SessionModule.Admin}>
      {children}
    </SessionAccessGuard>
  )
}
