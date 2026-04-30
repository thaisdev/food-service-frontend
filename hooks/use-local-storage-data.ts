"use client"

import { useMemo, useSyncExternalStore } from "react"

import {
  LOCAL_DATA_CHANGE_EVENT,
  ORDERS_STORAGE_KEY,
  PRODUCTS_STORAGE_KEY,
  mockOrders,
  mockProducts,
  parseOrders,
  parseProducts,
} from "@/lib/local-storage-data"

function subscribeToLocalData(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(LOCAL_DATA_CHANGE_EVENT, onStoreChange)

  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(LOCAL_DATA_CHANGE_EVENT, onStoreChange)
  }
}

function useRawLocalStorageItem(key: string) {
  return useSyncExternalStore(
    subscribeToLocalData,
    () => window.localStorage.getItem(key),
    () => undefined
  )
}

export function useProducts() {
  const rawProducts = useRawLocalStorageItem(PRODUCTS_STORAGE_KEY)

  return useMemo(() => {
    if (rawProducts === undefined) {
      return mockProducts
    }

    return parseProducts(rawProducts) ?? mockProducts
  }, [rawProducts])
}

export function useOrders() {
  const rawOrders = useRawLocalStorageItem(ORDERS_STORAGE_KEY)

  return useMemo(() => {
    if (rawOrders === undefined) {
      return mockOrders
    }

    return parseOrders(rawOrders) ?? mockOrders
  }, [rawOrders])
}
