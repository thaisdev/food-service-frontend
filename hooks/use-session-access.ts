"use client"

import { useMemo, useSyncExternalStore } from "react"

import {
  parseSessionAccess,
  SESSION_ACCESS_CHANGE_EVENT,
  SESSION_ACCESS_KEY,
} from "@/lib/session-access"

function subscribeToSessionAccess(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(SESSION_ACCESS_CHANGE_EVENT, onStoreChange)

  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(SESSION_ACCESS_CHANGE_EVENT, onStoreChange)
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
