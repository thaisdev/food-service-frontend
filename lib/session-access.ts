export const SESSION_ACCESS_KEY = "food-service:access"

export enum SessionModule {
  Admin = "admin",
  Customers = "customers",
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
    }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
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
}

export function clearSessionAccess() {
  window.sessionStorage.removeItem(SESSION_ACCESS_KEY)
}

export function getModuleHome(module: SessionAccess["module"]) {
  return module === SessionModule.Admin ? "/admin/dashboard" : "/customers/menu"
}
