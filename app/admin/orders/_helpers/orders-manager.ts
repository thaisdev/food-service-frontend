import { canCancelOrder } from "@/helpers/order-status"
import { type PaginatedResponse } from "@/lib/api-pagination"
import { OrderStatus, parseOrders, type Order } from "@/lib/data-schema"

export type OrderFilter = "Todos" | OrderStatus

export async function requestOrders(endpoint: string, options: RequestInit) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const message =
      ((await response.json().catch(() => null)) as { message?: string } | null)
        ?.message ?? "Não foi possível salvar os pedidos."

    throw new Error(message)
  }

  const orders = parseOrders(JSON.stringify(await response.json()))

  if (!orders) {
    throw new Error("Resposta invalida da API de pedidos.")
  }

  return orders
}

export function parsePaginatedOrders(
  value: unknown
): PaginatedResponse<Order> | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const data = value as {
    items?: unknown
    pagination?: {
      page?: unknown
      pageSize?: unknown
      totalItems?: unknown
      totalPages?: unknown
    }
  }
  const orders = parseOrders(data.items ? JSON.stringify(data.items) : null)

  if (
    !orders ||
    !data.pagination ||
    typeof data.pagination.page !== "number" ||
    typeof data.pagination.pageSize !== "number" ||
    typeof data.pagination.totalItems !== "number" ||
    typeof data.pagination.totalPages !== "number"
  ) {
    return null
  }

  return {
    items: orders,
    pagination: {
      page: data.pagination.page,
      pageSize: data.pagination.pageSize,
      totalItems: data.pagination.totalItems,
      totalPages: data.pagination.totalPages,
    },
  }
}

export function getOrderDateFilterValue(datetime: string) {
  const date = new Date(datetime)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function getTodayDateFilterValue() {
  return getOrderDateFilterValue(new Date().toISOString())
}

export function getOrderActionAvailability(order: Order) {
  const isCanceled = order.status === OrderStatus.Canceled
  const isFinished = order.status === OrderStatus.Finished
  const canCancel = canCancelOrder(order.status)

  return {
    canCancel,
    canEdit: !isCanceled && !isFinished,
    editTitle: isCanceled
      ? "Pedido cancelado não pode ser editado"
      : isFinished
        ? "Pedido finalizado não pode ser editado"
        : "Editar pedido",
    cancelTitle: isCanceled
      ? "Pedido cancelado"
      : canCancel
        ? "Cancelar pedido"
        : "Pedido pronto não pode ser cancelado",
  }
}
