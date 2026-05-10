import { NextResponse } from "next/server"

import { delay } from "@/lib/api-delay"
import { OrderStatus, parseOrders, type Order } from "@/lib/data-schema"
import { getOrders, getVisibleOrders, saveOrders } from "@/lib/server-data"

export const runtime = "nodejs"

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

function getCurrentOrderTime() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date())
}

function createOrderFromBody(
  body: Partial<Order>,
  id: string
): Order {
  return {
    id,
    customer: body.customer?.trim() ?? "",
    channel: body.channel?.trim() ?? "",
    items: body.items?.trim() ?? "",
    total: body.total?.trim() ?? "",
    status: OrderStatus.Waiting,
    time: getCurrentOrderTime(),
  }
}

function updateOrderFromBody(body: Partial<Order>, order: Order): Order {
  const status: OrderStatus = Object.values(OrderStatus).includes(
    body.status as OrderStatus
  )
    ? (body.status as OrderStatus)
    : order.status

  return {
    ...order,
    channel: body.channel?.trim() || order.channel,
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

export async function GET() {
  await delay()

  const orders = await getVisibleOrders()

  return NextResponse.json(orders)
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

  const order = updateOrderFromBody(body, currentOrder)

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
      { message: "Informe o pedido que será removido." },
      { status: 400 }
    )
  }

  const orders = await getOrders()
  let foundOrder = false
  const deletedAt = new Date().toISOString()
  const nextOrders = orders.map((order) => {
    if (order.id !== id || order.deletedAt) {
      return order
    }

    foundOrder = true

    return {
      ...order,
      deletedAt,
    }
  })

  if (!foundOrder) {
    return NextResponse.json(
      { message: "Pedido não encontrado." },
      { status: 404 }
    )
  }

  return NextResponse.json(filterVisibleOrders(await saveOrders(nextOrders)))
}
