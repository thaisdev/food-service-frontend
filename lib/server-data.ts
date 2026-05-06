import {
  mockOrders,
  mockProducts,
  parseOrders,
  parseProducts,
  type Product,
} from "@/lib/data-schema"
import {
  readServerJsonStore,
  writeServerJsonStore,
} from "@/lib/server-json-store"

export function getProducts() {
  return readServerJsonStore({
    exampleFile: "products.example.json",
    fallbackData: mockProducts,
    parse: parseProducts,
    runtimeFile: "products.json",
  })
}

export function getVisibleProducts() {
  return getProducts().then((products) =>
    products.filter((product) => !product.deletedAt)
  )
}

export function saveProducts(products: Product[]) {
  return writeServerJsonStore("products.json", products)
}

export function getOrders() {
  return readServerJsonStore({
    exampleFile: "orders.example.json",
    fallbackData: mockOrders,
    parse: parseOrders,
    runtimeFile: "orders.json",
  })
}
