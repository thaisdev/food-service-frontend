"use client"

import Link from "next/link"
import { RiAddLine, RiCloseLine, RiEditLine, RiEyeLine } from "@remixicon/react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/helpers/currency"
import { formatDatetime } from "@/helpers/datetime"
import { formatOrderItems, formatTable } from "@/helpers/order"
import { canCancelOrder } from "@/helpers/order-status"
import { OrderStatus, parseOrders, type Order } from "@/lib/data-schema"

type OrderFilter = "Todos" | OrderStatus

type OrdersManagerProps = {
  initialOrders: Order[]
}

function getStatusClasses(status: OrderStatus) {
  switch (status) {
    case OrderStatus.Ready:
      return "bg-success-muted text-success"
    case OrderStatus.Preparing:
      return "bg-warning-muted text-warning"
    case OrderStatus.Finished:
      return "bg-muted text-muted-foreground"
    case OrderStatus.Canceled:
      return "bg-destructive-muted text-destructive"
    case OrderStatus.Waiting:
      return "bg-destructive-muted text-destructive"
  }
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
        ?.message ?? "Não foi possível salvar os pedidos."

    throw new Error(message)
  }

  return parseOrders(JSON.stringify(await response.json())) ?? fallbackOrders
}

export function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [filter, setFilter] = useState<OrderFilter>("Todos")
  const [orderPendingCancel, setOrderPendingCancel] = useState<Order | null>(
    null
  )
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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

  const filteredOrders = useMemo(() => {
    if (filter === "Todos") {
      return orders
    }

    return orders.filter((order) => order.status === filter)
  }, [filter, orders])

  function getOrderActionAvailability(order: Order) {
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

  function confirmOrderCancellation(order: Order) {
    setMessage(null)

    startTransition(async () => {
      try {
        const nextOrders = await requestOrders(
          "/api/orders",
          {
            body: JSON.stringify({
              id: order.id,
              status: OrderStatus.Canceled,
              table: order.table,
            }),
            method: "PUT",
          },
          orders
        )

        setOrders(nextOrders)
        setOrderPendingCancel(null)
        setMessage("Pedido cancelado.")
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro inesperado.")
        setOrderPendingCancel(null)
      }
    })
  }

  return (
    <main className="min-h-svh bg-[image:var(--page-gradient)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-3xl border border-info/20 bg-card/85 p-8 shadow-sm shadow-info/5 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-2">
              <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Gerencie os pedidos cadastrados
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Cadastre, edite, acompanhe status e cancele pedidos.
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/orders/new">
                <RiAddLine aria-hidden />
                Novo pedido
              </Link>
            </Button>
          </div>
        </section>

        {message ? (
          <p className="rounded-md border border-info/20 bg-info-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {message}
          </p>
        ) : null}

        <section>
          <Card className="rounded-3xl border border-info/15 p-0 shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b border-info/15 bg-info-muted/45 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Pedidos cadastrados
                </CardTitle>
                <CardDescription className="text-sm">
                  Visualize, filtre e mantenha a fila operacional do sistema.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["Todos", ...Object.values(OrderStatus)] as const).map(
                  (currentFilter) => (
                    <Button
                      key={currentFilter}
                      onClick={() => setFilter(currentFilter)}
                      type="button"
                      variant={filter === currentFilter ? "default" : "outline"}
                    >
                      {currentFilter}
                    </Button>
                  )
                )}
              </div>
            </CardHeader>

            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead className="px-6 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      {(() => {
                        const actionAvailability =
                          getOrderActionAvailability(order)

                        return (
                          <>
                            <TableCell className="px-6">
                              <p className="font-medium">{order.id}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatTable(order.table)}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{order.customer}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatTable(order.table)}
                              </p>
                            </TableCell>
                            <TableCell className="min-w-72">
                              <p className="text-sm leading-6">
                                {formatOrderItems(order.items)}
                              </p>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(order.total)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusClasses(order.status)}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatDatetime(order.datetime)}
                            </TableCell>
                            <TableCell className="px-6 text-right">
                              <div className="inline-flex gap-1">
                                <Button
                                  asChild
                                  size="icon-sm"
                                  title="Ver pedido"
                                  variant="ghost"
                                >
                                  <Link
                                    href={`/admin/orders/details/${encodeURIComponent(
                                      order.id
                                    )}`}
                                  >
                                    <RiEyeLine aria-hidden />
                                  </Link>
                                </Button>
                                {!actionAvailability.canEdit ? (
                                  <Button
                                    disabled
                                    size="icon-sm"
                                    title={actionAvailability.editTitle}
                                    type="button"
                                    variant="ghost"
                                  >
                                    <RiEditLine aria-hidden />
                                  </Button>
                                ) : (
                                  <Button
                                    asChild
                                    size="icon-sm"
                                    title={actionAvailability.editTitle}
                                    variant="ghost"
                                  >
                                    <Link
                                      href={`/admin/orders/edit/${encodeURIComponent(
                                        order.id
                                      )}`}
                                    >
                                      <RiEditLine aria-hidden />
                                    </Link>
                                  </Button>
                                )}
                                <Button
                                  disabled={
                                    isPending || !actionAvailability.canCancel
                                  }
                                  onClick={() => setOrderPendingCancel(order)}
                                  size="icon-sm"
                                  title={actionAvailability.cancelTitle}
                                  type="button"
                                  variant="destructive"
                                >
                                  <RiCloseLine aria-hidden />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )
                      })()}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>

      {orderPendingCancel ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <Card className="w-full max-w-md rounded-2xl border border-destructive/20 p-0 shadow-xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-destructive/15 bg-destructive-muted/45 p-6">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Cancelar pedido
                </CardTitle>
                <CardDescription className="text-sm">
                  O pedido continuará na listagem com status cancelado.
                </CardDescription>
              </div>
              <Button
                disabled={isPending}
                onClick={() => setOrderPendingCancel(null)}
                size="icon-sm"
                title="Fechar modal"
                type="button"
                variant="ghost"
              >
                <RiCloseLine aria-hidden />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
                <p className="text-sm font-medium">
                  {orderPendingCancel.id} · {orderPendingCancel.customer}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatOrderItems(orderPendingCancel.items)}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  disabled={isPending}
                  onClick={() => setOrderPendingCancel(null)}
                  type="button"
                  variant="outline"
                >
                  <RiCloseLine aria-hidden />
                  Voltar
                </Button>
                <Button
                  disabled={isPending}
                  onClick={() => confirmOrderCancellation(orderPendingCancel)}
                  type="button"
                  variant="destructive"
                >
                  <RiCloseLine aria-hidden />
                  {isPending ? "Cancelando..." : "Cancelar pedido"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  )
}
