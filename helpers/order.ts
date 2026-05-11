import { type OrderItem, type Product } from "@/lib/data-schema"

export type SelectedOrderItem = {
  observation: string
  productId: string
  quantity: number
}

export function formatTable(table: number) {
  return `Mesa ${String(table).padStart(2, "0")}`
}

export function parseTable(table: string) {
  const match = table.match(/\d+/)
  const tableNumber = match ? Number(match[0]) : Number.NaN

  return Number.isInteger(tableNumber) && tableNumber > 0 ? tableNumber : null
}

export function formatOrderItems(items: OrderItem[]) {
  return items
    .map((item) => {
      const observation = item.observation.trim()

      return `${item.quantity}x ${item.name}${
        observation ? ` (${observation})` : ""
      }`
    })
    .join(", ")
}

export function createOrderItems(
  selectedItems: SelectedOrderItem[],
  products: Product[]
): OrderItem[] {
  return selectedItems
    .map((item) => {
      const product = products.find(
        (currentProduct) => currentProduct.id === item.productId
      )

      if (!product) {
        return null
      }

      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        valor: product.price,
        observation: item.observation.trim(),
      }
    })
    .filter((item): item is OrderItem => item !== null)
}

export function calculateOrderTotal(items: OrderItem[]) {
  return items.reduce((total, item) => total + item.valor * item.quantity, 0)
}
