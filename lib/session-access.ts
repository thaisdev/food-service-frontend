export const SESSION_ACCESS_KEY = "food-service:access"
export const SESSION_ACCESS_CHANGE_EVENT = "session-access:changed"

export enum SessionModule {
  Admin = "admin",
  Customers = "customers",
}

export type SessionCartItem = {
  productId: string
  quantity: number
  observation: string
}

export type SessionAccess =
  | {
      module: SessionModule.Admin
      email: string
    }
  | {
      module: SessionModule.Customers
      name: string
      table: string
      cart: SessionCartItem[]
    }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function parseSessionCartItems(value: unknown): SessionCartItem[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(
    (item): item is SessionCartItem =>
      isRecord(item) &&
      typeof item.productId === "string" &&
      typeof item.quantity === "number" &&
      typeof item.observation === "string"
  )
}

export function parseSessionAccess(
  rawAccess: string | null
): SessionAccess | null {
  if (!rawAccess) {
    return null
  }

  try {
    const access = JSON.parse(rawAccess) as unknown

    if (!isRecord(access)) {
      return null
    }

    if (
      access.module === SessionModule.Admin &&
      typeof access.email === "string" &&
      access.email.trim()
    ) {
      return {
        module: SessionModule.Admin,
        email: access.email.trim(),
      }
    }

    if (
      access.module === SessionModule.Customers &&
      typeof access.name === "string" &&
      typeof access.table === "string" &&
      access.name.trim() &&
      access.table.trim()
    ) {
      return {
        module: SessionModule.Customers,
        name: access.name.trim(),
        table: access.table.trim(),
        cart: parseSessionCartItems(access.cart),
      }
    }
  } catch {
    return null
  }

  return null
}

export function getSessionAccess(): SessionAccess | null {
  if (typeof window === "undefined") {
    return null
  }

  const rawAccess = window.sessionStorage.getItem(SESSION_ACCESS_KEY)
  const access = parseSessionAccess(rawAccess)

  if (rawAccess && !access) {
    window.sessionStorage.removeItem(SESSION_ACCESS_KEY)
  }

  return access
}

export function setSessionAccess(access: SessionAccess) {
  window.sessionStorage.setItem(SESSION_ACCESS_KEY, JSON.stringify(access))
  window.dispatchEvent(new Event(SESSION_ACCESS_CHANGE_EVENT))
}

export function clearSessionAccess() {
  window.sessionStorage.removeItem(SESSION_ACCESS_KEY)
  window.dispatchEvent(new Event(SESSION_ACCESS_CHANGE_EVENT))
}

export function getModuleHome(module: SessionAccess["module"]) {
  return module === SessionModule.Admin ? "/admin/dashboard" : "/customers/menu"
}
