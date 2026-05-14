import {
  getSessionAccess,
  SessionModule,
  setSessionAccess,
  type SessionCartItem,
} from "@/lib/session-access"

export const CUSTOMER_CART_CHANGED_EVENT = "customer-cart:changed"

export type CustomerCartItem = SessionCartItem

function dispatchCustomerCartChange() {
  window.dispatchEvent(new Event(CUSTOMER_CART_CHANGED_EVENT))
}

export function readCustomerCart() {
  if (typeof window === "undefined") {
    return []
  }

  const access = getSessionAccess()

  return access?.module === SessionModule.Customers ? access.cart : []
}

export function writeCustomerCart(cartItems: CustomerCartItem[]) {
  const access = getSessionAccess()

  if (access?.module !== SessionModule.Customers) {
    return
  }

  setSessionAccess({
    ...access,
    cart: cartItems,
  })
  dispatchCustomerCartChange()
}

export function clearCustomerCart() {
  writeCustomerCart([])
}
