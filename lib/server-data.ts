import {
  mockCategories,
  mockOrders,
  mockProducts,
  parseCategories,
  parseOrders,
  parseProducts,
  resolveProductCategoryId,
  type Category,
  type Order,
  type Product,
} from "@/lib/data-schema"
import {
  readServerJsonStore,
  writeServerJsonStore,
} from "@/lib/server-json-store"

function normalizeProductCategoryIds(products: Product[], categories: Category[]) {
  let changed = false
  const nextProducts = products.map((product) => {
    const categoryId = resolveProductCategoryId(product, categories)

    if (categoryId === product.categoryId) {
      return product
    }

    changed = true

    return {
      ...product,
      categoryId,
    }
  })

  return { changed, products: nextProducts }
}

export async function getProducts() {
  const [products, categories] = await Promise.all([
    readServerJsonStore({
      exampleFile: "products.example.json",
      fallbackData: mockProducts,
      parse: parseProducts,
      runtimeFile: "products.json",
    }),
    getCategories(),
  ])
  const normalizedProducts = normalizeProductCategoryIds(products, categories)

  if (normalizedProducts.changed) {
    await saveProducts(normalizedProducts.products)
  }

  return normalizedProducts.products
}

export function getRawProducts() {
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

export function getCategories() {
  return readServerJsonStore({
    exampleFile: "categories.example.json",
    fallbackData: mockCategories,
    parse: parseCategories,
    runtimeFile: "categories.json",
  })
}

export function getVisibleCategories() {
  return getCategories().then((categories) =>
    categories.filter((category) => !category.deletedAt)
  )
}

export function saveCategories(categories: Category[]) {
  return writeServerJsonStore("categories.json", categories)
}

export function getOrders() {
  return readServerJsonStore({
    exampleFile: "orders.example.json",
    fallbackData: mockOrders,
    parse: parseOrders,
    runtimeFile: "orders.json",
  })
}

export function getVisibleOrders() {
  return getOrders().then((orders) => orders.filter((order) => !order.deletedAt))
}

export function saveOrders(orders: Order[]) {
  return writeServerJsonStore("orders.json", orders)
}
