import {
  mockOrders,
  mockProducts,
  parseOrders,
  parseProducts,
} from "@/lib/data-schema"
import { readServerJsonStore } from "@/lib/server-json-store"

export function getProducts() {
  return readServerJsonStore({
    exampleFile: "products.example.json",
    fallbackData: mockProducts,
    parse: parseProducts,
    runtimeFile: "products.json",
  })
}

export function getOrders() {
  return readServerJsonStore({
    exampleFile: "orders.example.json",
    fallbackData: mockOrders,
    parse: parseOrders,
    runtimeFile: "orders.json",
  })
}
