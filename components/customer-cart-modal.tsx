"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { RiCloseLine, RiDeleteBinLine, RiSendPlaneLine } from "@remixicon/react"
import { FormEvent, useMemo, useState, useTransition } from "react"

import {
  CUSTOMER_CART_KEY,
  type CustomerCartItem,
} from "@/components/customer-menu"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useProducts } from "@/hooks/use-api-data"
import { useSessionAccess } from "@/hooks/use-session-access"
import { formatProductPrice, type OrderItem } from "@/lib/data-schema"
import { SessionModule } from "@/lib/session-access"

function readCustomerCart() {
  try {
    const data = JSON.parse(
      window.localStorage.getItem(CUSTOMER_CART_KEY) ?? "[]"
    ) as unknown

    if (!Array.isArray(data)) {
      return []
    }

    return data.filter(
      (item): item is CustomerCartItem =>
        typeof item === "object" &&
        item !== null &&
        "productId" in item &&
        "quantity" in item &&
        "observation" in item &&
        typeof item.productId === "string" &&
        typeof item.quantity === "number" &&
        typeof item.observation === "string"
    )
  } catch {
    return []
  }
}

function writeCustomerCart(cartItems: CustomerCartItem[]) {
  window.localStorage.setItem(CUSTOMER_CART_KEY, JSON.stringify(cartItems))
  window.dispatchEvent(new Event("customer-cart:changed"))
}

function clearCustomerCart() {
  window.localStorage.removeItem(CUSTOMER_CART_KEY)
  window.dispatchEvent(new Event("customer-cart:changed"))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value)
}

function parseTable(table: string) {
  const match = table.match(/\d+/)
  const tableNumber = match ? Number(match[0]) : Number.NaN

  return Number.isInteger(tableNumber) && tableNumber > 0 ? tableNumber : 1
}

export function CustomerCartModal() {
  const router = useRouter()
  const products = useProducts()
  const access = useSessionAccess()
  const [cartItems, setCartItems] =
    useState<CustomerCartItem[]>(readCustomerCart)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const customerName =
    access?.module === SessionModule.Customers ? access.name : "Cliente"
  const tableNumber =
    access?.module === SessionModule.Customers ? parseTable(access.table) : 1

  const orderItems = useMemo<OrderItem[]>(() => {
    return cartItems
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
  }, [cartItems, products])
  const total = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.valor * item.quantity, 0),
    [orderItems]
  )

  function updateCartItem(
    productId: string,
    field: "observation" | "quantity",
    value: string
  ) {
    setCartItems((currentItems) => {
      const nextItems = currentItems.map((item) => {
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

      writeCustomerCart(nextItems)

      return nextItems
    })
  }

  function removeCartItem(productId: string) {
    setCartItems((currentItems) => {
      const nextItems = currentItems.filter((item) => item.productId !== productId)

      writeCustomerCart(nextItems)

      return nextItems
    })
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    if (!orderItems.length) {
      setMessage("Adicione ao menos um item ao carrinho.")
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
            ((await response.json().catch(() => null)) as {
              message?: string
            } | null)?.message ?? "Não foi possível enviar o pedido."

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
                    return null
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
              <Button asChild variant="outline">
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
