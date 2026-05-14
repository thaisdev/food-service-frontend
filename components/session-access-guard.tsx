"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"

import {
  getModuleHome,
  SessionModule,
  type SessionAccess,
} from "@/lib/session-access"
import { useSessionAccess } from "@/hooks/use-session-access"

type SessionAccessGuardProps = {
  children: ReactNode
  module: SessionAccess["module"]
}

export function SessionAccessGuard({
  children,
  module,
}: SessionAccessGuardProps) {
  const router = useRouter()
  const access = useSessionAccess()
  const canAccess = access?.module === module

  useEffect(() => {
    if (access === undefined) {
      return
    }

    if (!access) {
      router.replace(
        module === SessionModule.Customers ? "/customers/menu/login" : "/"
      )
      return
    }

    if (access.module !== module) {
      router.replace(getModuleHome(access.module))
      return
    }
  }, [access, module, router])

  if (!canAccess) {
    return null
  }

  return children
}
