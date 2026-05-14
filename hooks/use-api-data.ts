"use client"

import { useEffect, useState } from "react"

import {
  parseCategories,
  parseOrders,
  parseProducts,
  type Category,
  type Order,
  type Product,
} from "@/lib/data-schema"

async function fetchJsonData<T>(
  endpoint: string,
  parse: (rawData: string | null) => T[] | null
) {
  try {
    const response = await fetch(endpoint, { cache: "no-store" })

    if (!response.ok) {
      return []
    }

    const rawData = JSON.stringify(await response.json())

    return parse(rawData) ?? []
  } catch {
    return []
  }
}

export function useProducts() {
  return useProductsData().products
}

export function useProductsData() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCurrent = true

    fetchJsonData("/api/products", parseProducts).then((data) => {
      if (isCurrent) {
        setProducts(data)
        setIsLoading(false)
      }
    })

    return () => {
      isCurrent = false
    }
  }, [])

  return { isLoading, products }
}

export function useCategories() {
  return useCategoriesData().categories
}

export function useCategoriesData() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCurrent = true

    fetchJsonData("/api/categories", parseCategories).then((data) => {
      if (isCurrent) {
        setCategories(data)
        setIsLoading(false)
      }
    })

    return () => {
      isCurrent = false
    }
  }, [])

  return { categories, isLoading }
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCurrent = true

    fetchJsonData("/api/orders", parseOrders).then((data) => {
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
