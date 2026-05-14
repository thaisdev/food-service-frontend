"use client"

import { useMemo, useSyncExternalStore } from "react"

import { parseSessionAccess, SESSION_ACCESS_KEY } from "@/lib/session-access"

function subscribeToSessionAccess(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)

  return () => {
    window.removeEventListener("storage", onStoreChange)
  }
}

export function useSessionAccess() {
  const rawAccess = useSyncExternalStore(
    subscribeToSessionAccess,
    () => window.sessionStorage.getItem(SESSION_ACCESS_KEY),
    () => undefined
  )

  return useMemo(() => {
    if (rawAccess === undefined) {
      return undefined
    }

    return parseSessionAccess(rawAccess)
  }, [rawAccess])
}
