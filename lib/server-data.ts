import {
  parseCategories,
  parseOrders,
  parseProducts,
  resolveProductCategoryId,
  type Category,
  type Order,
  type Product,
} from "@/lib/data-schema"
import { readServerStore, writeServerStore } from "@/lib/server-firestore-store"

function normalizeProductCategoryIds(
  products: Product[],
  categories: Category[]
) {
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
    readServerStore({
      collectionName: "products",
      parse: parseProducts,
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
  return readServerStore({
    collectionName: "products",
    parse: parseProducts,
  })
}

export function getVisibleProducts() {
  return getProducts().then((products) =>
    products.filter((product) => !product.deletedAt)
  )
}

export function saveProducts(products: Product[]) {
  return writeServerStore("products", products)
}

export function getCategories() {
  return readServerStore({
    collectionName: "categories",
    parse: parseCategories,
  })
}

export function getVisibleCategories() {
  return getCategories().then((categories) =>
    categories.filter((category) => !category.deletedAt)
  )
}

export function saveCategories(categories: Category[]) {
  return writeServerStore("categories", categories)
}

export function getOrders() {
  return readServerStore({
    collectionName: "orders",
    parse: parseOrders,
  })
}

export function getVisibleOrders() {
  return getOrders().then((orders) =>
    orders.filter((order) => !order.deletedAt)
  )
}

export function saveOrders(orders: Order[]) {
  return writeServerStore("orders", orders)
}
