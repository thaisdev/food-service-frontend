"use client"

import Link from "next/link"
import {
  RiAddLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeLine,
  RiMotorbikeLine,
  RiRestaurant2Line,
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
import { OrderStatus, parseOrders, type Order } from "@/lib/data-schema"

type OrderFilter = "Todos" | OrderStatus

type OrdersManagerProps = {
  initialOrders: Order[]
}

const metricColors = [
  "border-info/25 bg-info-muted/65 shadow-info/5",
  "border-success/25 bg-success-muted/65 shadow-success/5",
  "border-warning/20 bg-warning-muted/45 shadow-warning/5",
]

function getStatusClasses(status: OrderStatus) {
  switch (status) {
    case OrderStatus.Ready:
      return "bg-success-muted text-success"
    case OrderStatus.Preparing:
      return "bg-warning-muted text-warning"
    case OrderStatus.OutForDelivery:
      return "bg-info-muted text-info"
    case OrderStatus.Finished:
      return "bg-muted text-muted-foreground"
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
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [orderPendingDelete, setOrderPendingDelete] = useState<Order | null>(
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

  const metrics = useMemo(() => {
    const activeOrders = orders.filter(
      (order) => order.status !== OrderStatus.Finished
    ).length
    const pendingOrders = orders.filter(
      (order) => order.status === OrderStatus.Waiting
    ).length
    const deliveryOrders = orders.filter(
      (order) => order.status === OrderStatus.OutForDelivery
    ).length
    const revenue = orders.reduce((total, order) => total + order.total, 0)

    return [
      {
        label: "Pedidos ativos",
        value: String(activeOrders),
        detail: `${pendingOrders} aguardando preparo`,
      },
      {
        label: "Receita listada",
        value: formatCurrency(revenue),
        detail: "Soma dos pedidos cadastrados",
      },
      {
        label: "Entregas em rota",
        value: String(deliveryOrders),
        detail: "Pedidos com saída para entrega",
      },
    ]
  }, [orders])

  function confirmOrderDeletion(order: Order) {
    setMessage(null)

    startTransition(async () => {
      try {
        const nextOrders = await requestOrders(
          `/api/orders?id=${encodeURIComponent(order.id)}`,
          { method: "DELETE" },
          orders
        )

        setOrders(nextOrders)
        setOrderPendingDelete(null)
        setMessage("Pedido removido.")
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro inesperado.")
        setOrderPendingDelete(null)
      }
    })
  }

  return (
    <main className="min-h-svh bg-[image:var(--page-gradient)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-3xl border border-info/20 bg-card/85 p-8 shadow-sm shadow-info/5 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-2">
              <span className="inline-flex w-fit rounded-full bg-info px-3 py-1 text-xs font-medium text-info-foreground">
                Painel administrativo
              </span>
              <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Gerencie os pedidos cadastrados
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Cadastre, edite, acompanhe status e remova pedidos do mock
                persistente usado pela API.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/orders/new">
                <RiAddLine aria-hidden />
                Novo pedido
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {metrics.map((item, index) => (
            <Card
              key={item.label}
              className={`rounded-2xl border p-2 shadow-sm ${metricColors[index]}`}
            >
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <strong className="mt-3 block text-3xl font-semibold tracking-tight">
                  {item.value}
                </strong>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.detail}
                </p>
              </CardContent>
            </Card>
          ))}
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
                            onClick={() => setViewingOrder(order)}
                            size="icon-sm"
                            title="Ver pedido"
                            type="button"
                            variant="ghost"
                          >
                            <RiEyeLine aria-hidden />
                          </Button>
                          <Button
                            asChild
                            size="icon-sm"
                            title="Editar pedido"
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
                          <Button
                            disabled={isPending}
                            onClick={() => setOrderPendingDelete(order)}
                            size="icon-sm"
                            title="Excluir pedido"
                            type="button"
                            variant="destructive"
                          >
                            <RiDeleteBinLine aria-hidden />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-3xl border border-warning/20 bg-card/95 p-2 shadow-sm shadow-warning/5">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Fila operacional
              </CardTitle>
              <CardDescription className="text-sm">
                Status que pedem acompanhamento no turno atual.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {[
                {
                  title: "Aguardando",
                  description: `${orders.filter((order) => order.status === OrderStatus.Waiting).length} pedidos pendentes`,
                  icon: RiTimeLine,
                  className:
                    "border-destructive/25 bg-destructive-muted/50 text-destructive",
                },
                {
                  title: "Em preparo",
                  description: `${orders.filter((order) => order.status === OrderStatus.Preparing).length} pedidos na cozinha`,
                  icon: RiRestaurant2Line,
                  className: "border-warning/25 bg-warning-muted/55 text-warning",
                },
                {
                  title: "Saiu para entrega",
                  description: `${orders.filter((order) => order.status === OrderStatus.OutForDelivery).length} entregas ativas`,
                  icon: RiMotorbikeLine,
                  className: "border-info/25 bg-info-muted/55 text-info",
                },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.title}
                    className={`flex items-start gap-3 rounded-2xl border p-4 ${item.className}`}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-card/80">
                      <Icon aria-hidden className="size-4" />
                    </span>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-current/80">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-info/20 bg-card/95 p-2 shadow-sm shadow-info/5">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Dados do mock
              </CardTitle>
              <CardDescription className="text-sm">
                A API usa o arquivo persistente criado dentro de data/runtime.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {[
                "GET /api/orders lista os pedidos",
                "POST /api/orders cadastra um novo pedido",
                "PUT /api/orders edita um pedido existente",
                "DELETE /api/orders?id=%231028 remove um pedido",
              ].map((task) => (
                <div
                  key={task}
                  className="rounded-2xl border border-info/25 bg-info-muted/55 p-4 text-sm"
                >
                  {task}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>

      {viewingOrder ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <Card className="w-full max-w-xl rounded-2xl border border-info/15 p-0 shadow-xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-info/15 bg-info-muted/45 p-6">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Pedido {viewingOrder.id}
                </CardTitle>
                <CardDescription className="text-sm">
                  Detalhes cadastrados para acompanhamento administrativo.
                </CardDescription>
              </div>
              <Button
                onClick={() => setViewingOrder(null)}
                size="icon-sm"
                title="Fechar modal"
                type="button"
                variant="ghost"
              >
                <RiCloseLine aria-hidden />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Cliente", viewingOrder.customer],
                  ["Mesa", formatTable(viewingOrder.table)],
                  ["Total", formatCurrency(viewingOrder.total)],
                  ["Hora", formatDatetime(viewingOrder.datetime)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border/70 bg-muted/35 p-4"
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
                <p className="text-xs text-muted-foreground">Itens</p>
                <p className="mt-1 text-sm font-medium">
                  {formatOrderItems(viewingOrder.items)}
                </p>
              </div>

              <Badge className={getStatusClasses(viewingOrder.status)}>
                {viewingOrder.status}
              </Badge>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {orderPendingDelete ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <Card className="w-full max-w-md rounded-2xl border border-destructive/20 p-0 shadow-xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-destructive/15 bg-destructive-muted/45 p-6">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Confirmar exclusão
                </CardTitle>
                <CardDescription className="text-sm">
                  O pedido será removido da listagem administrativa.
                </CardDescription>
              </div>
              <Button
                disabled={isPending}
                onClick={() => setOrderPendingDelete(null)}
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
                  {orderPendingDelete.id} · {orderPendingDelete.customer}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatOrderItems(orderPendingDelete.items)}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  disabled={isPending}
                  onClick={() => setOrderPendingDelete(null)}
                  type="button"
                  variant="outline"
                >
                  <RiCloseLine aria-hidden />
                  Cancelar
                </Button>
                <Button
                  disabled={isPending}
                  onClick={() => confirmOrderDeletion(orderPendingDelete)}
                  type="button"
                  variant="destructive"
                >
                  <RiDeleteBinLine aria-hidden />
                  {isPending ? "Excluindo..." : "Excluir"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  )
}
