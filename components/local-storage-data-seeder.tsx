"use client"

import { useEffect } from "react"

import { seedLocalStorageData } from "@/lib/local-storage-data"

export function LocalStorageDataSeeder() {
  useEffect(() => {
    seedLocalStorageData()
  }, [])

  return null
}
