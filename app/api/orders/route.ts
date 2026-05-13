import { NextResponse } from "next/server"

import { calculateOrderTotal, parseTable } from "@/helpers/order"
import { canCancelOrder, canUpdateOrderStatus } from "@/helpers/order-status"
import { delay } from "@/lib/api-delay"
import { paginateItems, parsePaginationParams } from "@/lib/api-pagination"
import {
  OrderStatus,
  parseOrders,
  type Order,
  type OrderItem,
} from "@/lib/data-schema"
import { getOrders, getVisibleOrders, saveOrders } from "@/lib/server-data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

function filterVisibleOrders(orders: Order[]) {
  return orders.filter((order) => !order.deletedAt)
}

function isValidOrder(order: Order) {
  return Boolean(parseOrders(JSON.stringify([order])))
}

function createOrderId(orders: Order[]) {
  const nextNumber =
    orders.reduce((highest, order) => {
      const match = order.id.match(/^#?(\d+)$/)

      return match ? Math.max(highest, Number(match[1])) : highest
    }, 0) + 1

  return `#${String(nextNumber).padStart(4, "0")}`
}

function getCurrentOrderDatetime() {
  return new Date().toISOString()
}

function getOrderDateFilterValue(datetime: string) {
  const date = new Date(datetime)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function normalizeOrderItems(items: Partial<OrderItem>[] | undefined) {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item) => ({
    productId: item.productId?.trim() ?? "",
    name: item.name?.trim() ?? "",
    quantity:
      typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? item.quantity
        : 1,
    valor:
      typeof item.valor === "number" && Number.isFinite(item.valor)
        ? item.valor
        : Number.NaN,
    observation: item.observation?.trim() ?? "",
  }))
}

function parseOrderTable(value: unknown) {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null
  }

  if (typeof value !== "string") {
    return null
  }

  return parseTable(value)
}

function createOrderFromBody(
  body: Partial<Order>,
  id: string
): Order {
  const items = normalizeOrderItems(body.items)

  return {
    id,
    customer: body.customer?.trim() ?? "",
    table: parseOrderTable(body.table) ?? Number.NaN,
    items,
    total: calculateOrderTotal(items),
    status: OrderStatus.Waiting,
    datetime: getCurrentOrderDatetime(),
  }
}

function resolveOrderStatus(body: Partial<Order>, order: Order) {
  return Object.values(OrderStatus).includes(body.status as OrderStatus)
    ? (body.status as OrderStatus)
    : order.status
}

function updateOrderFromBody(
  body: Partial<Order>,
  order: Order,
  status: OrderStatus
): Order {
  return {
    ...order,
    table: parseOrderTable(body.table) ?? order.table,
    status,
  }
}

async function readOrderRequest(request: Request) {
  try {
    return (await request.json()) as Partial<Order>
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  await delay()

  const { searchParams } = new URL(request.url)
  const orders = await getVisibleOrders()

  if (!searchParams.has("page")) {
    return NextResponse.json(orders)
  }

  const status = searchParams.get("status")
  const date = searchParams.get("date") ?? ""
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      !status ||
      (Object.values(OrderStatus).includes(status as OrderStatus) &&
        order.status === status)
    const matchesDate =
      !date || getOrderDateFilterValue(order.datetime) === date

    return matchesStatus && matchesDate
  })
  const { page, pageSize } = parsePaginationParams(searchParams)

  return NextResponse.json(paginateItems(filteredOrders, page, pageSize))
}

export async function POST(request: Request) {
  await delay()

  const body = await readOrderRequest(request)

  if (!body) {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 })
  }

  const orders = await getOrders()
  const order = createOrderFromBody(body, createOrderId(orders))

  if (!isValidOrder(order)) {
    return NextResponse.json(
      { message: "Preencha os dados obrigatórios do pedido." },
      { status: 400 }
    )
  }

  const nextOrders = await saveOrders([order, ...orders])

  return NextResponse.json(filterVisibleOrders(nextOrders), { status: 201 })
}

export async function PUT(request: Request) {
  await delay()

  const body = await readOrderRequest(request)

  if (!body?.id) {
    return NextResponse.json(
      { message: "Informe o pedido que será editado." },
      { status: 400 }
    )
  }

  const orders = await getOrders()
  const currentOrder = orders.find((order) => order.id === body.id)

  if (!currentOrder) {
    return NextResponse.json(
      { message: "Pedido não encontrado." },
      { status: 404 }
    )
  }

  const status = resolveOrderStatus(body, currentOrder)

  if (
    [OrderStatus.Canceled, OrderStatus.Finished].includes(currentOrder.status)
  ) {
    return NextResponse.json(
      { message: "Pedidos cancelados ou finalizados não podem ser editados." },
      { status: 400 }
    )
  }

  if (!canUpdateOrderStatus(currentOrder.status, status)) {
    return NextResponse.json(
      {
        message:
          "O status do pedido não pode voltar e pedidos prontos não podem ser cancelados.",
      },
      { status: 400 }
    )
  }

  const order = updateOrderFromBody(body, currentOrder, status)

  if (!isValidOrder(order)) {
    return NextResponse.json(
      { message: "Preencha os dados obrigatórios do pedido." },
      { status: 400 }
    )
  }

  const nextOrders = orders.map((currentOrder) => {
    if (currentOrder.id !== order.id) {
      return currentOrder
    }

    return {
      ...order,
      deletedAt: currentOrder.deletedAt,
    }
  })

  return NextResponse.json(filterVisibleOrders(await saveOrders(nextOrders)))
}

export async function DELETE(request: Request) {
  await delay()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json(
      { message: "Informe o pedido que será cancelado." },
      { status: 400 }
    )
  }

  const orders = await getOrders()
  let foundOrder = false
  let canCancelCurrentOrder = true
  const nextOrders = orders.map((order) => {
    if (order.id !== id || order.deletedAt) {
      return order
    }

    if (!canCancelOrder(order.status)) {
      foundOrder = true
      canCancelCurrentOrder = false

      return order
    }

    foundOrder = true
    return {
      ...order,
      status: OrderStatus.Canceled,
    }
  })

  if (!foundOrder) {
    return NextResponse.json(
      { message: "Pedido não encontrado." },
      { status: 404 }
    )
  }

  if (!canCancelCurrentOrder) {
    return NextResponse.json(
      { message: "Pedidos prontos ou cancelados não podem ser cancelados." },
      { status: 400 }
    )
  }

  return NextResponse.json(filterVisibleOrders(await saveOrders(nextOrders)))
}
