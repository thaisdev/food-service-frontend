"use client"

import {
  RiAddLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeLine,
  RiMotorbikeLine,
  RiRestaurant2Line,
  RiSaveLine,
  RiTimeLine,
} from "@remixicon/react"
import { FormEvent, useMemo, useState, useTransition } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  OrderStatus,
  formatProductPrice,
  parseOrders,
  type Order,
  type OrderItem,
  type Product,
} from "@/lib/data-schema"

type OrderFilter = "Todos" | OrderStatus

type OrderFormData = Omit<Order, "id" | "deletedAt">

type SelectedOrderItem = {
  observation: string
  productId: string
  quantity: number
}

type OrdersManagerProps = {
  initialOrders: Order[]
  initialProducts: Product[]
}

const emptyForm: OrderFormData = {
  customer: "",
  table: 1,
  items: [],
  total: 0,
  status: OrderStatus.Waiting,
  datetime: "",
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value)
}

function formatOrderDatetime(datetime: string) {
  const date = new Date(datetime)

  if (Number.isNaN(date.getTime())) {
    return datetime
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function formatTable(table: number) {
  return `Mesa ${String(table).padStart(2, "0")}`
}

function formatOrderItems(items: OrderItem[]) {
  return items
    .map((item) => {
      const observation = item.observation.trim()

      return `${item.quantity}x ${item.name}${
        observation ? ` (${observation})` : ""
      }`
    })
    .join(", ")
}

function createOrderItems(
  selectedItems: SelectedOrderItem[],
  products: Product[]
): OrderItem[] {
  return selectedItems
    .map((item) => {
      const product = products.find(
        (currentProduct) => currentProduct.id === item.productId
      )

      if (!product) {
        return null
      }

      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        valor: product.price,
        observation: item.observation.trim(),
      }
    })
    .filter((item): item is OrderItem => item !== null)
}

function calculateOrderTotal(
  selectedItems: SelectedOrderItem[],
  products: Product[]
) {
  return selectedItems.reduce((total, item) => {
    const product = products.find(
      (currentProduct) => currentProduct.id === item.productId
    )

    return total + (product?.price ?? 0) * item.quantity
  }, 0)
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

export function OrdersManager({
  initialOrders,
  initialProducts,
}: OrdersManagerProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [filter, setFilter] = useState<OrderFilter>("Todos")
  const [formData, setFormData] = useState<OrderFormData>(emptyForm)
  const [selectedItems, setSelectedItems] = useState<SelectedOrderItem[]>([])
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [orderPendingDelete, setOrderPendingDelete] = useState<Order | null>(
    null
  )
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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

  const calculatedTotal = useMemo(
    () => calculateOrderTotal(selectedItems, initialProducts),
    [initialProducts, selectedItems]
  )

function updateFormData(field: keyof OrderFormData, value: string) {
    setFormData((currentData) => ({
      ...currentData,
      [field]:
        field === "table"
          ? Number.isInteger(Number(value)) && Number(value) > 0
            ? Number(value)
            : 1
          : value,
    }))
  }

  function startOrderCreation() {
    setMessage(null)
    setEditingOrder(null)
    setFormData(emptyForm)
    setSelectedItems([])
    setIsFormOpen(true)
  }

  function startOrderEdition(order: Order) {
    setMessage(null)
    setEditingOrder(order)
    setFormData({
      customer: order.customer,
      table: order.table,
      items: order.items,
      total: order.total,
      status: order.status,
      datetime: order.datetime,
    })
    setSelectedItems([])
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingOrder(null)
    setFormData(emptyForm)
    setSelectedItems([])
  }

  function toggleProduct(product: Product, checked: boolean) {
    setSelectedItems((currentItems) => {
      if (!checked) {
        return currentItems.filter((item) => item.productId !== product.id)
      }

      if (currentItems.some((item) => item.productId === product.id)) {
        return currentItems
      }

      return [
        ...currentItems,
        {
          observation: "",
          productId: product.id,
          quantity: 1,
        },
      ]
    })
  }

  function updateSelectedItem(
    productId: string,
    field: "observation" | "quantity",
    value: string
  ) {
    setSelectedItems((currentItems) =>
      currentItems.map((item) => {
        if (item.productId !== productId) {
          return item
        }

        if (field === "quantity") {
          const quantity = Number(value)

          return {
            ...item,
            quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
          }
        }

        return {
          ...item,
          observation: value,
        }
      })
    )
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    if (editingOrder) {
      const payload = {
        id: editingOrder.id,
        table: formData.table,
        status: formData.status,
      }

      startTransition(async () => {
        try {
          const nextOrders = await requestOrders(
            "/api/orders",
            {
              body: JSON.stringify(payload),
              method: "PUT",
            },
            orders
          )

          setOrders(nextOrders)
          setMessage("Pedido atualizado.")
          closeForm()
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Erro inesperado.")
        }
      })

      return
    }

    const items = createOrderItems(selectedItems, initialProducts)

    if (!items.length) {
      setMessage("Selecione ao menos um produto para o pedido.")
      return
    }

    const orderData = {
      ...formData,
      customer: formData.customer.trim(),
      table: formData.table,
      items,
      status: OrderStatus.Waiting,
      datetime: "",
      total: calculatedTotal,
    }

    startTransition(async () => {
      try {
        const nextOrders = await requestOrders(
          "/api/orders",
          {
            body: JSON.stringify(orderData),
            method: "POST",
          },
          orders
        )

        setOrders(nextOrders)
        setMessage("Pedido criado.")
        closeForm()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro inesperado.")
      }
    })
  }

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
            <Button onClick={startOrderCreation} type="button" variant="outline">
              <RiAddLine aria-hidden />
              Novo pedido
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
                        {formatOrderDatetime(order.datetime)}
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
                            onClick={() => startOrderEdition(order)}
                            size="icon-sm"
                            title="Editar pedido"
                            type="button"
                            variant="ghost"
                          >
                            <RiEditLine aria-hidden />
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

      {isFormOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <Card className="max-h-[calc(100svh-2rem)] w-full max-w-2xl overflow-hidden rounded-2xl border border-info/15 p-0 shadow-xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-info/15 bg-info-muted/45 p-6">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {editingOrder ? "Editar pedido" : "Novo pedido"}
                </CardTitle>
                <CardDescription className="text-sm">
                  As alterações são enviadas para a API e gravadas no mock.
                </CardDescription>
              </div>
              <Button
                disabled={isPending}
                onClick={closeForm}
                size="icon-sm"
                title="Fechar modal"
                type="button"
                variant="ghost"
              >
                <RiCloseLine aria-hidden />
              </Button>
            </CardHeader>

            <CardContent className="max-h-[calc(100svh-9rem)] overflow-y-auto p-6">
              <form className="space-y-4" onSubmit={submitOrder}>
                {editingOrder ? (
                  <>
                    <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
                      <p className="text-sm font-medium">
                        {editingOrder.id} · {editingOrder.customer}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatOrderItems(editingOrder.items)}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-xs font-medium" htmlFor="table">
                          Mesa
                        </label>
                        <Input
                          id="table"
                          min={1}
                          onChange={(event) =>
                            updateFormData("table", event.target.value)
                          }
                          placeholder="1"
                          required
                          type="number"
                          value={formData.table}
                        />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs font-medium" htmlFor="status">
                          Status
                        </label>
                        <select
                          className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                          id="status"
                          onChange={(event) =>
                            updateFormData("status", event.target.value)
                          }
                          value={formData.status}
                        >
                          {Object.values(OrderStatus).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-xs font-medium" htmlFor="customer">
                      Cliente
                    </label>
                    <Input
                      id="customer"
                      onChange={(event) =>
                        updateFormData("customer", event.target.value)
                      }
                      required
                      value={formData.customer}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium" htmlFor="table">
                      Mesa
                    </label>
                    <Input
                      id="table"
                      min={1}
                      onChange={(event) =>
                        updateFormData("table", event.target.value)
                      }
                      placeholder="1"
                      required
                      type="number"
                      value={formData.table}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <span className="text-xs font-medium">Itens</span>
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                    {initialProducts.length ? (
                      <div className="grid gap-3">
                        {initialProducts.map((product) => {
                          const selectedItem = selectedItems.find(
                            (item) => item.productId === product.id
                          )
                          const isSelected = Boolean(selectedItem)

                          return (
                            <div
                              key={product.id}
                              className="rounded-xl border border-border/70 bg-card/80 p-3"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <label
                                  className="flex min-w-0 items-start gap-3"
                                  htmlFor={`order-product-${product.id}`}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    id={`order-product-${product.id}`}
                                    onCheckedChange={(checked) =>
                                      toggleProduct(product, checked === true)
                                    }
                                  />
                                  <span className="min-w-0">
                                    <span className="block text-sm font-medium">
                                      {product.name}
                                    </span>
                                    <span className="mt-1 block text-xs text-muted-foreground">
                                      {formatProductPrice(product.price)}
                                    </span>
                                  </span>
                                </label>
                              </div>

                              {selectedItem ? (
                                <div className="mt-3 grid gap-3 md:grid-cols-[8rem_1fr]">
                                  <div className="grid gap-2">
                                    <label
                                      className="text-xs font-medium"
                                      htmlFor={`order-product-quantity-${product.id}`}
                                    >
                                      Quantidade
                                    </label>
                                    <Input
                                      id={`order-product-quantity-${product.id}`}
                                      min={1}
                                      onChange={(event) =>
                                        updateSelectedItem(
                                          product.id,
                                          "quantity",
                                          event.target.value
                                        )
                                      }
                                      type="number"
                                      value={selectedItem.quantity}
                                    />
                                  </div>

                                  <div className="grid gap-2">
                                    <label
                                      className="text-xs font-medium"
                                      htmlFor={`order-product-observations-${product.id}`}
                                    >
                                      Observações
                                    </label>
                                    <Input
                                      id={`order-product-observations-${product.id}`}
                                      onChange={(event) =>
                                        updateSelectedItem(
                                          product.id,
                                          "observation",
                                          event.target.value
                                        )
                                      }
                                      placeholder="Ex: Sem cebola"
                                      value={selectedItem.observation}
                                    />
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-warning/20 bg-warning-muted/45 p-4 text-sm text-muted-foreground">
                        Cadastre produtos antes de montar os itens do pedido.
                      </p>
                    )}
                  </div>
                  {selectedItems.length ? (
                    <p className="text-xs text-muted-foreground">
                      {formatOrderItems(
                        createOrderItems(selectedItems, initialProducts)
                      )}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-info/15 bg-info-muted/35 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatCurrency(calculatedTotal)}
                    </p>
                  </div>
                </div>
                  </>
                )}

                {message ? (
                  <p className="rounded-md border border-info/20 bg-info-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    {message}
                  </p>
                ) : null}

                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button
                    className="bg-success text-success-foreground hover:bg-success/90"
                    disabled={isPending}
                    type="submit"
                  >
                    <RiSaveLine aria-hidden />
                    {editingOrder ? "Salvar" : "Cadastrar"}
                  </Button>
                  <Button
                    disabled={isPending}
                    onClick={closeForm}
                    type="button"
                    variant="outline"
                  >
                    <RiCloseLine aria-hidden />
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

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
                  ["Hora", formatOrderDatetime(viewingOrder.datetime)],
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
