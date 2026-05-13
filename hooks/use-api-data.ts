"use client"

import { useEffect, useState } from "react"

import {
  mockOrders,
  mockCategories,
  mockProducts,
  parseCategories,
  parseOrders,
  parseProducts,
  type Category,
  type Order,
  type Product,
} from "@/lib/data-schema"

async function fetchJsonData<T>(
  endpoint: string,
  parse: (rawData: string | null) => T[] | null,
  fallbackData: T[]
) {
  try {
    const response = await fetch(endpoint, { cache: "no-store" })

    if (!response.ok) {
      return fallbackData
    }

    const rawData = JSON.stringify(await response.json())

    return parse(rawData) ?? fallbackData
  } catch {
    return fallbackData
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(mockProducts)

  useEffect(() => {
    let isCurrent = true

    fetchJsonData("/api/products", parseProducts, mockProducts).then((data) => {
      if (isCurrent) {
        setProducts(data)
      }
    })

    return () => {
      isCurrent = false
    }
  }, [])

  return products
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)

  useEffect(() => {
    let isCurrent = true

    fetchJsonData("/api/categories", parseCategories, mockCategories).then(
      (data) => {
        if (isCurrent) {
          setCategories(data)
        }
      }
    )

    return () => {
      isCurrent = false
    }
  }, [])

  return categories
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCurrent = true

    fetchJsonData("/api/orders", parseOrders, mockOrders).then((data) => {
      if (isCurrent) {
        setOrders(data)
        setIsLoading(false)
      }
    })

    return () => {
      isCurrent = false
    }
  }, [])

  return { isLoading, orders }
}
