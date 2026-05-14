"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  RiAddLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiSendPlaneLine,
} from "@remixicon/react"
import { FormEvent, useMemo, useState, useTransition } from "react"

import {
  clearCustomerCart,
  readCustomerCart,
  writeCustomerCart,
  type CustomerCartItem,
} from "@/app/customers/menu/_helpers/cart"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatProductPrice } from "@/helpers/currency"
import {
  calculateOrderTotal,
  createOrderItems,
  parseTable,
} from "@/helpers/order"
import { useProducts } from "@/hooks/use-api-data"
import { useSessionAccess } from "@/hooks/use-session-access"
import { type OrderItem } from "@/lib/data-schema"
import { SessionModule } from "@/lib/session-access"

type EditableCartItem = Omit<CustomerCartItem, "quantity"> & {
  quantity: number | ""
}

function normalizeCartItems(cartItems: EditableCartItem[]): CustomerCartItem[] {
  return cartItems.map((item) => ({
    ...item,
    quantity:
      typeof item.quantity === "number" &&
      Number.isFinite(item.quantity) &&
      item.quantity > 0
        ? item.quantity
        : 1,
  }))
}

function hasInvalidQuantity(cartItems: EditableCartItem[]) {
  return cartItems.some(
    (item) =>
      typeof item.quantity !== "number" ||
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0
  )
}

export function CustomerCartModal() {
  const router = useRouter()
  const products = useProducts()
  const access = useSessionAccess()
  const [cartItems, setCartItems] =
    useState<EditableCartItem[]>(readCustomerCart)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const customerName =
    access?.module === SessionModule.Customers ? access.name : "Cliente"
  const tableNumber =
    access?.module === SessionModule.Customers
      ? (parseTable(access.table) ?? 1)
      : 1

  const orderItems = useMemo<OrderItem[]>(() => {
    return createOrderItems(cartItems, products)
  }, [cartItems, products])
  const total = useMemo(() => calculateOrderTotal(orderItems), [orderItems])

  function updateCartItem(
    productId: string,
    field: "observation" | "quantity",
    value: string
  ) {
    const nextItems = cartItems.map((item) => {
      if (item.productId !== productId) {
        return item
      }

      if (field === "quantity") {
        if (!value) {
          return {
            ...item,
            quantity: "" as const,
          }
        }

        const quantity = Number(value)

        if (Number.isFinite(quantity) && quantity > 0) {
          return {
            ...item,
            quantity,
          }
        }

        return item
      }

      return {
        ...item,
        observation: value,
      }
    })

    setCartItems(nextItems)
    writeCustomerCart(normalizeCartItems(nextItems))
  }

  function removeCartItem(productId: string) {
    const nextItems = cartItems.filter((item) => item.productId !== productId)

    setCartItems(nextItems)
    writeCustomerCart(normalizeCartItems(nextItems))
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    if (!orderItems.length) {
      setMessage("Adicione ao menos um item ao carrinho.")
      return
    }

    if (hasInvalidQuantity(cartItems)) {
      setMessage("Informe a quantidade dos produtos no carrinho.")
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/orders", {
          body: JSON.stringify({
            customer: customerName,
            table: tableNumber,
            items: orderItems,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })

        if (!response.ok) {
          const errorMessage =
            (
              (await response.json().catch(() => null)) as {
                message?: string
              } | null
            )?.message ?? "Não foi possível enviar o pedido."

          throw new Error(errorMessage)
        }

        clearCustomerCart()
        router.replace("/customers/menu")
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
      <Card className="max-h-[calc(100svh-2rem)] w-full max-w-2xl overflow-hidden rounded-2xl border border-success/20 p-0 shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-success/15 bg-success-muted/45 p-6">
          <div>
            <CardTitle className="text-lg font-semibold">Carrinho</CardTitle>
            <CardDescription className="text-sm">
              Ajuste quantidades e observações antes de enviar o pedido.
            </CardDescription>
          </div>
          <Button asChild size="icon-sm" title="Fechar modal" variant="ghost">
            <Link href="/customers/menu">
              <RiCloseLine aria-hidden />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="max-h-[calc(100svh-9rem)] overflow-y-auto p-6">
          <form className="space-y-4" onSubmit={submitOrder}>
            <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
              <p className="text-sm font-medium">{customerName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Mesa {tableNumber}
              </p>
            </div>

            {cartItems.length ? (
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const product = products.find(
                    (currentProduct) => currentProduct.id === item.productId
                  )

                  if (!product) {
                    return (
                      <div
                        key={item.productId}
                        className="rounded-2xl border border-border/70 bg-card/80 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                          </div>
                          <Button
                            onClick={() => removeCartItem(item.productId)}
                            size="icon-sm"
                            title="Remover item"
                            type="button"
                            variant="destructive"
                          >
                            <RiDeleteBinLine aria-hidden />
                          </Button>
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-[8rem_1fr]">
                          <div className="grid gap-2">
                            <label
                              className="text-xs font-medium"
                              htmlFor={`cart-quantity-${item.productId}`}
                            >
                              Quantidade
                            </label>
                            <Input
                              id={`cart-quantity-${item.productId}`}
                              min={1}
                              onChange={(event) =>
                                updateCartItem(
                                  item.productId,
                                  "quantity",
                                  event.target.value
                                )
                              }
                              type="number"
                              value={item.quantity}
                            />
                          </div>

                          <div className="grid gap-2">
                            <label
                              className="text-xs font-medium"
                              htmlFor={`cart-observation-${item.productId}`}
                            >
                              Observações
                            </label>
                            <Input
                              id={`cart-observation-${item.productId}`}
                              onChange={(event) =>
                                updateCartItem(
                                  item.productId,
                                  "observation",
                                  event.target.value
                                )
                              }
                              placeholder="Ex: Sem cebola"
                              value={item.observation}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={item.productId}
                      className="rounded-2xl border border-border/70 bg-card/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatProductPrice(product.price)}
                          </p>
                        </div>
                        <Button
                          onClick={() => removeCartItem(item.productId)}
                          size="icon-sm"
                          title="Remover item"
                          type="button"
                          variant="destructive"
                        >
                          <RiDeleteBinLine aria-hidden />
                        </Button>
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-[8rem_1fr]">
                        <div className="grid gap-2">
                          <label
                            className="text-xs font-medium"
                            htmlFor={`cart-quantity-${item.productId}`}
                          >
                            Quantidade
                          </label>
                          <Input
                            id={`cart-quantity-${item.productId}`}
                            min={1}
                            onChange={(event) =>
                              updateCartItem(
                                item.productId,
                                "quantity",
                                event.target.value
                              )
                            }
                            type="number"
                            value={item.quantity}
                          />
                        </div>

                        <div className="grid gap-2">
                          <label
                            className="text-xs font-medium"
                            htmlFor={`cart-observation-${item.productId}`}
                          >
                            Observações
                          </label>
                          <Input
                            id={`cart-observation-${item.productId}`}
                            onChange={(event) =>
                              updateCartItem(
                                item.productId,
                                "observation",
                                event.target.value
                              )
                            }
                            placeholder="Ex: Sem cebola"
                            value={item.observation}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="rounded-2xl border border-warning/20 bg-warning-muted/45 p-4 text-sm text-muted-foreground">
                Seu carrinho está vazio.
              </p>
            )}

            <div className="rounded-2xl border border-success/20 bg-success-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="mt-1 text-sm font-semibold">
                {formatCurrency(total)}
              </p>
            </div>

            {message ? (
              <p className="rounded-md border border-destructive/20 bg-destructive-muted/40 px-3 py-2 text-xs text-muted-foreground">
                {message}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button>
                <RiAddLine aria-hidden />
                <Link href="/customers/menu">Adicionar mais itens</Link>
              </Button>
              <Button
                className="bg-success text-success-foreground hover:bg-success/90"
                disabled={isPending}
                type="submit"
              >
                <RiSendPlaneLine aria-hidden />
                {isPending ? "Enviando..." : "Enviar pedido"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
