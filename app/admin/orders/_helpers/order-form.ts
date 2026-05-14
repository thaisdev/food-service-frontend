import { type FormEvent } from "react"

import { type SelectedOrderItem } from "@/helpers/order"
import {
  OrderStatus,
  parseOrders,
  type Order,
  type OrderItem,
} from "@/lib/data-schema"

export type SubmitAction = "continue" | "close"

type NewOrderSavePayload = Pick<Order, "customer" | "items" | "table">
type EditOrderSavePayload = Pick<Order, "id" | "status" | "table">

export type OrderSavePayload = NewOrderSavePayload | EditOrderSavePayload

type CreateOrderSavePayloadParams = {
  customer: string
  order?: Order
  orderItems: OrderItem[]
  status: OrderStatus
  table: number | ""
}

export async function requestOrderSave(payload: OrderSavePayload) {
  const isEditing = "id" in payload
  const response = await fetch("/api/orders", {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: isEditing ? "PUT" : "POST",
  })

  if (!response.ok) {
    const message =
      ((await response.json().catch(() => null)) as { message?: string } | null)
        ?.message ?? "Não foi possível salvar o pedido."

    throw new Error(message)
  }

  return parseOrders(JSON.stringify(await response.json()))
}

export function getSubmitAction(
  event: FormEvent<HTMLFormElement>
): SubmitAction {
  const submitter = (event.nativeEvent as SubmitEvent)
    .submitter as HTMLButtonElement | null

  return submitter?.value === "continue" ? "continue" : "close"
}

export function normalizeOrderTable(table: number | "") {
  return typeof table === "number" && Number.isInteger(table) && table > 0
    ? table
    : 1
}

export function createOrderSavePayload({
  customer,
  order,
  orderItems,
  status,
  table,
}: CreateOrderSavePayloadParams): OrderSavePayload {
  const normalizedTable = normalizeOrderTable(table)

  if (order) {
    return {
      id: order.id,
      status,
      table: normalizedTable,
    }
  }

  return {
    customer: customer.trim(),
    items: orderItems,
    table: normalizedTable,
  }
}

export function hasInvalidQuantity(items: SelectedOrderItem[]) {
  return items.some(
    (item) =>
      typeof item.quantity !== "number" ||
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0
  )
}
