"use client"

import Link from "next/link"
import {
  RiAddLine,
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiExternalLinkLine,
  RiShoppingBag3Line,
  RiTimeLine,
} from "@remixicon/react"
import { useEffect, useMemo, useState, useTransition } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/helpers/currency"
import { formatDatetime } from "@/helpers/datetime"
import { formatOrderItems, formatTable } from "@/helpers/order"
import { ORDER_STATUS_FLOW } from "@/helpers/order-status"
import {
  OrderStatus,
  ProductStock,
  parseOrders,
  type Order,
  type Product,
} from "@/lib/data-schema"

type AdminDashboardProps = {
  initialOrders: Order[]
  products: Product[]
}

const activeOrderStatuses = [
  OrderStatus.Ready,
  OrderStatus.Preparing,
  OrderStatus.Waiting,
] as readonly OrderStatus[]

function getStatusClasses(status: OrderStatus) {
  switch (status) {
    case OrderStatus.Ready:
      return "bg-success-muted text-success"
    case OrderStatus.Preparing:
      return "bg-warning-muted text-warning"
    case OrderStatus.Waiting:
      return "bg-destructive-muted text-destructive"
    case OrderStatus.Finished:
      return "bg-muted text-muted-foreground"
    case OrderStatus.Canceled:
      return "bg-destructive-muted text-destructive"
  }
}

function getStockClasses(stock: ProductStock) {
  switch (stock) {
    case ProductStock.Available:
      return "bg-success-muted text-success"
    case ProductStock.Low:
      return "bg-warning-muted text-warning"
    case ProductStock.Unavailable:
      return "bg-destructive-muted text-destructive"
  }
}

function getMetricClasses(status: OrderStatus) {
  switch (status) {
    case OrderStatus.Ready:
      return "border-success/25 bg-success-muted/70 shadow-success/5"
    case OrderStatus.Preparing:
      return "border-warning/25 bg-warning-muted/70 shadow-warning/5"
    case OrderStatus.Waiting:
      return "border-destructive/20 bg-destructive-muted/60 shadow-destructive/5"
    case OrderStatus.Finished:
      return "border-muted bg-muted/70 shadow-muted/5"
    case OrderStatus.Canceled:
      return "border-destructive/20 bg-destructive-muted/60 shadow-destructive/5"
  }
}

function getTodayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(date)
}

function isTodayOrder(order: Order, todayKey: string) {
  const orderDate = new Date(order.datetime)

  return (
    !Number.isNaN(orderDate.getTime()) && getTodayKey(orderDate) === todayKey
  )
}

function getNextStatus(status: OrderStatus) {
  const currentIndex = ORDER_STATUS_FLOW.findIndex(
    (currentStatus) => currentStatus === status
  )

  return currentIndex >= 0 ? ORDER_STATUS_FLOW[currentIndex + 1] : undefined
}

async function requestOrders(
  endpoint: string,
  options: RequestInit,
  fallbackOrders: Order[]
) {
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
        ?.message ?? "Não foi possível atualizar o pedido."

    throw new Error(message)
  }

  return parseOrders(JSON.stringify(await response.json())) ?? fallbackOrders
}

export function AdminDashboard({
  initialOrders,
  products,
}: AdminDashboardProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [message, setMessage] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const todayKey = getTodayKey(new Date())

  useEffect(() => {
    function updateOrders(event: Event) {
      const orderEvent = event as CustomEvent<Order[]>

      setOrders(orderEvent.detail)
      setMessage(null)
    }

    window.addEventListener("admin-orders:changed", updateOrders)

    return () => {
      window.removeEventListener("admin-orders:changed", updateOrders)
    }
  }, [])

  const allTodaysOrders = useMemo(
    () => orders.filter((order) => isTodayOrder(order, todayKey)),
    [orders, todayKey]
  )

  const todaysOrders = useMemo(() => {
    const statusWeight = new Map<OrderStatus, number>(
      activeOrderStatuses.map((status, index) => [status, index])
    )

    return allTodaysOrders
      .filter((order) => activeOrderStatuses.includes(order.status))
      .sort((firstOrder, secondOrder) => {
        const statusDifference =
          (statusWeight.get(firstOrder.status) ?? 99) -
          (statusWeight.get(secondOrder.status) ?? 99)

        if (statusDifference !== 0) {
          return statusDifference
        }

        return (
          new Date(firstOrder.datetime).getTime() -
          new Date(secondOrder.datetime).getTime()
        )
      })
  }, [allTodaysOrders])

  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.stock === ProductStock.Low ||
          product.stock === ProductStock.Unavailable
      ),
    [products]
  )

  const statusTotals = activeOrderStatuses.map((status) => ({
    label: status,
    total: todaysOrders.filter((order) => order.status === status).length,
  }))

  function advanceOrderStatus(order: Order) {
    const nextStatus = getNextStatus(order.status)

    if (!nextStatus) {
      return
    }

    setMessage(null)
    setUpdatingOrderId(order.id)

    startTransition(async () => {
      try {
        const nextOrders = await requestOrders(
          "/api/orders",
          {
            body: JSON.stringify({
              id: order.id,
              status: nextStatus,
              table: order.table,
            }),
            method: "PUT",
          },
          orders
        )

        setOrders(nextOrders)
        window.dispatchEvent(
          new CustomEvent<Order[]>("admin-orders:changed", {
            detail: nextOrders,
          })
        )
        setMessage(`Pedido ${order.id} movido para ${nextStatus}.`)
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro inesperado.")
      } finally {
        setUpdatingOrderId(null)
      }
    })
  }

  return (
    <main className="min-h-svh bg-[image:var(--page-gradient)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-3xl border border-info/20 bg-card/85 p-8 shadow-sm shadow-info/5 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-2">
              <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Painel operacional
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Acompanhe os pedidos ativos do dia e resolva as pendências mais
                urgentes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/admin/orders/new?returnTo=/admin/dashboard">
                  <RiAddLine aria-hidden />
                  Novo pedido
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/orders">
                  <RiExternalLinkLine aria-hidden />
                  Ver todos os pedidos
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-info/25 bg-info-muted/70 p-5 shadow-sm shadow-info/5">
            <p className="flex items-center gap-2 text-xs font-medium text-info">
              <RiShoppingBag3Line aria-hidden className="size-4" />
              Pedidos de hoje
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {allTodaysOrders.length}
            </p>
          </div>
          {statusTotals.map((metric) => (
            <div
              className={`rounded-2xl border p-5 shadow-sm ${getMetricClasses(
                metric.label
              )}`}
              key={metric.label}
            >
              <p className="text-xs font-medium text-foreground/75">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-semibold">{metric.total}</p>
            </div>
          ))}
        </section>

        {message ? (
          <p className="rounded-md border border-info/20 bg-info-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {message}
          </p>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Card className="rounded-3xl border border-info/15 p-0 shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b border-info/15 bg-info-muted/45 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Pedidos ativos
                </CardTitle>
                <CardDescription className="text-sm">
                  {todaysOrders.length} pedidos sem cancelados ou finalizados,
                  ordenados por prioridade operacional.
                </CardDescription>
              </div>
              <Button asChild variant="link">
                <Link href="/admin/orders">
                  Ver todos os pedidos
                  <RiArrowRightLine aria-hidden />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {todaysOrders.length > 0 ? (
                <div className="divide-y divide-border/70">
                  {todaysOrders.map((order) => {
                    const nextStatus = getNextStatus(order.status)
                    const isUpdating = isPending && updatingOrderId === order.id

                    return (
                      <article
                        className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                        key={order.id}
                      >
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{order.id}</p>
                            <Badge className={getStatusClasses(order.status)}>
                              {order.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTable(order.table)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {order.customer}
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                              {formatOrderItems(order.items)}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span>{formatDatetime(order.datetime)}</span>
                            <span>{formatCurrency(order.total)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 md:justify-end">
                          {nextStatus ? (
                            <Button
                              disabled={isPending}
                              onClick={() => advanceOrderStatus(order)}
                              type="button"
                            >
                              <RiCheckboxCircleLine aria-hidden />
                              {isUpdating
                                ? "Atualizando..."
                                : `Mover para ${nextStatus}`}
                            </Button>
                          ) : null}
                          <Button asChild variant="outline">
                            <Link
                              href={`/admin/orders/details/${encodeURIComponent(
                                order.id
                              )}?returnTo=/admin/dashboard`}
                            >
                              <RiExternalLinkLine aria-hidden />
                              Detalhes
                            </Link>
                          </Button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="flex min-h-56 flex-col items-center justify-center gap-2 p-8 text-center">
                  <RiTimeLine
                    aria-hidden
                    className="size-8 text-muted-foreground"
                  />
                  <p className="text-sm font-medium">
                    Nenhum pedido ativo hoje
                  </p>
                  <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                    Quando novos pedidos entrarem, eles aparecem aqui para
                    avanço rápido de status.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-warning/20 p-0 shadow-sm">
            <CardHeader className="border-b border-warning/15 bg-warning-muted/45 p-6">
              <CardTitle className="text-lg font-semibold">
                Ações que precisam de atenção
              </CardTitle>
              <CardDescription className="text-sm">
                Itens de estoque baixo ou indisponível que podem afetar novos
                pedidos.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {lowStockProducts.length > 0 ? (
                <div className="divide-y divide-border/70">
                  {lowStockProducts.map((product) => (
                    <div
                      className="flex items-center justify-between gap-3 p-5"
                      key={product.id}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {product.id}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge className={getStockClasses(product.stock)}>
                          {product.stock}
                        </Badge>
                        <Button
                          asChild
                          size="icon-sm"
                          title="Editar produto"
                          variant="ghost"
                        >
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <RiExternalLinkLine aria-hidden />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-sm leading-6 text-muted-foreground">
                  Nenhuma pendência de estoque no momento.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
