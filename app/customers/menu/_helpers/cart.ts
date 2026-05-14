export const CUSTOMER_CART_KEY = "food-service:customer-cart"

export type CustomerCartItem = {
  productId: string
  quantity: number
  observation: string
}

export function readCustomerCart() {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const data = JSON.parse(
      window.localStorage.getItem(CUSTOMER_CART_KEY) ?? "[]"
    ) as unknown

    if (!Array.isArray(data)) {
      return []
    }

    return data.filter(
      (item): item is CustomerCartItem =>
        typeof item === "object" &&
        item !== null &&
        "productId" in item &&
        "quantity" in item &&
        "observation" in item &&
        typeof item.productId === "string" &&
        typeof item.quantity === "number" &&
        typeof item.observation === "string"
    )
  } catch {
    return []
  }
}

export function writeCustomerCart(cartItems: CustomerCartItem[]) {
  window.localStorage.setItem(CUSTOMER_CART_KEY, JSON.stringify(cartItems))
  window.dispatchEvent(new Event("customer-cart:changed"))
}

export function clearCustomerCart() {
  window.localStorage.removeItem(CUSTOMER_CART_KEY)
  window.dispatchEvent(new Event("customer-cart:changed"))
}
