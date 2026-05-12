"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { RiAddLine, RiCloseLine, RiSaveLine } from "@remixicon/react"
import { FormEvent, useMemo, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatProductPrice } from "@/helpers/currency"
import {
  calculateOrderTotal,
  createOrderItems,
  formatOrderItems,
  type SelectedOrderItem,
} from "@/helpers/order"
import { getEditableOrderStatuses } from "@/helpers/order-status"
import {
  OrderStatus,
  parseOrders,
  type Order,
  type Product,
} from "@/lib/data-schema"

type AdminOrderFormModalProps = {
  closeHref?: string
  order?: Order
  products?: Product[]
}

type SubmitAction = "continue" | "close"

async function requestOrderSave(
  payload:
    | Pick<Order, "customer" | "items" | "table">
    | Pick<Order, "id" | "status" | "table">
) {
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

export function AdminOrderFormModal({
  closeHref = "/admin/orders",
  order,
  products = [],
}: AdminOrderFormModalProps) {
  const router = useRouter()
  const [customer, setCustomer] = useState("")
  const [table, setTable] = useState(order?.table ?? 1)
  const [status, setStatus] = useState(order?.status ?? OrderStatus.Waiting)
  const [selectedItems, setSelectedItems] = useState<SelectedOrderItem[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const orderItems = useMemo(
    () => createOrderItems(selectedItems, products),
    [products, selectedItems]
  )
  const calculatedTotal = useMemo(
    () => calculateOrderTotal(orderItems),
    [orderItems]
  )
  const editableStatuses = useMemo(
    () => (order ? getEditableOrderStatuses(order.status) : []),
    [order]
  )

  function updateTable(value: string) {
    const nextTable = Number(value)

    setTable(Number.isInteger(nextTable) && nextTable > 0 ? nextTable : 1)
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

  function resetNewOrderForm() {
    setCustomer("")
    setTable(1)
    setSelectedItems([])
  }

  function getSubmitAction(event: FormEvent<HTMLFormElement>): SubmitAction {
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null

    return submitter?.value === "continue" ? "continue" : "close"
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    const submitAction = getSubmitAction(event)
    const payload = order
      ? {
          id: order.id,
          status,
          table,
        }
      : {
          customer: customer.trim(),
          items: orderItems,
          table,
        }

    if (!order && !orderItems.length) {
      setMessage("Selecione ao menos um produto para o pedido.")
      return
    }

    startTransition(async () => {
      try {
        const nextOrders = await requestOrderSave(payload)

        if (nextOrders) {
          window.dispatchEvent(
            new CustomEvent<Order[]>("admin-orders:changed", {
              detail: nextOrders,
            })
          )
        }

        if (!order && submitAction === "continue") {
          resetNewOrderForm()
          setMessage("Pedido cadastrado. Você pode cadastrar mais pedidos.")
          return
        }

        router.replace(closeHref)
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro inesperado.")
      }
    })
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <Card className="max-h-[calc(100svh-2rem)] w-full max-w-2xl overflow-hidden rounded-2xl border border-info/15 p-0 shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-info/15 bg-info-muted/45 p-6">
          <div>
            <CardTitle className="text-lg font-semibold">
              {order ? "Editar pedido" : "Novo pedido"}
            </CardTitle>
            <CardDescription className="text-sm">
              As alterações são enviadas para a API e gravadas no mock.
            </CardDescription>
          </div>
          <Button asChild size="icon-sm" title="Fechar modal" variant="ghost">
            <Link href={closeHref}>
              <RiCloseLine aria-hidden />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="max-h-[calc(100svh-9rem)] overflow-y-auto p-6">
          <form className="space-y-4" onSubmit={submitOrder}>
            {order ? (
              <>
                <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
                  <p className="text-sm font-medium">
                    {order.id} · {order.customer}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatOrderItems(order.items)}
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
                      onChange={(event) => updateTable(event.target.value)}
                      placeholder="1"
                      required
                      type="number"
                      value={table}
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
                        setStatus(event.target.value as OrderStatus)
                      }
                      value={status}
                    >
                      {editableStatuses.map((currentStatus) => (
                        <option key={currentStatus} value={currentStatus}>
                          {currentStatus}
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
                      onChange={(event) => setCustomer(event.target.value)}
                      required
                      value={customer}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium" htmlFor="table">
                      Mesa
                    </label>
                    <Input
                      id="table"
                      min={1}
                      onChange={(event) => updateTable(event.target.value)}
                      placeholder="1"
                      required
                      type="number"
                      value={table}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <span className="text-xs font-medium">Itens</span>
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                    {products.length ? (
                      <div className="grid gap-3">
                        {products.map((product) => {
                          const selectedItem = selectedItems.find(
                            (item) => item.productId === product.id
                          )
                          const isSelected = Boolean(selectedItem)

                          return (
                            <div
                              key={product.id}
                              className="rounded-xl border border-border/70 bg-card/80 p-3"
                            >
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
                                      htmlFor={`order-product-observation-${product.id}`}
                                    >
                                      Observações
                                    </label>
                                    <Input
                                      id={`order-product-observation-${product.id}`}
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
                  {orderItems.length ? (
                    <p className="text-xs text-muted-foreground">
                      {formatOrderItems(orderItems)}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-info/15 bg-info-muted/35 p-4">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatCurrency(calculatedTotal)}
                  </p>
                </div>
              </>
            )}

            {message ? (
              <p className="rounded-md border border-info/20 bg-info-muted/40 px-3 py-2 text-xs text-muted-foreground">
                {message}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              {order ? (
                <Button
                  className="bg-success text-success-foreground hover:bg-success/90"
                  disabled={isPending}
                  type="submit"
                >
                  <RiSaveLine aria-hidden />
                  Salvar
                </Button>
              ) : (
                <>
                  <Button
                    disabled={isPending}
                    name="submitAction"
                    type="submit"
                    value="continue"
                    variant="outline"
                  >
                    <RiAddLine aria-hidden />
                    Cadastrar mais pedidos
                  </Button>
                  <Button
                    className="bg-success text-success-foreground hover:bg-success/90"
                    disabled={isPending}
                    name="submitAction"
                    type="submit"
                    value="close"
                  >
                    <RiSaveLine aria-hidden />
                    Salvar e fechar
                  </Button>
                </>
              )}
              <Button asChild variant="outline">
                <Link href={closeHref}>
                  <RiCloseLine aria-hidden />
                  Cancelar
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
