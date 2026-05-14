"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { RiCloseLine } from "@remixicon/react"
import { useState } from "react"

import { clearCustomerCart } from "@/app/customers/menu/_helpers/cart"
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
import { formatTable, parseTable } from "@/helpers/order"
import { useOrders } from "@/hooks/use-api-data"
import { useSessionAccess } from "@/hooks/use-session-access"
import { OrderStatus, type Order } from "@/lib/data-schema"
import { clearSessionAccess, SessionModule } from "@/lib/session-access"

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

function filterCustomerOrders(
  orders: Order[],
  access: ReturnType<typeof useSessionAccess>
) {
  if (access?.module !== SessionModule.Customers) {
    return []
  }

  const table = parseTable(access.table)
  const customer = access.name.toLocaleLowerCase("pt-BR")

  return orders.filter(
    (order) =>
      order.customer.toLocaleLowerCase("pt-BR") === customer &&
      (table === null || order.table === table)
  )
}

export function CustomerOrders() {
  const router = useRouter()
  const access = useSessionAccess()
  const { isLoading, orders } = useOrders()
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)
  const customerOrders = filterCustomerOrders(orders, access)
  const total = customerOrders.reduce((sum, order) => sum + order.total, 0)

  function confirmBillRequest() {
    clearCustomerCart()
    clearSessionAccess()
    router.push("/")
  }

  return (
    <main className="min-h-[calc(100svh-73px)] bg-[image:var(--page-gradient)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="grid gap-4">
          <Card className="rounded-3xl border border-primary/25 bg-primary-muted/45 p-2 shadow-sm shadow-primary/5">
            <CardContent className="p-4">
              <p className="text-sm text-brand-muted">
                Total consumido:
                <strong className="mt-3 block text-3xl font-semibold">
                  {formatCurrency(total)}
                </strong>
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild className="bg-success">
                  <Link href="/customers/menu">Voltar ao cardápio</Link>
                </Button>
                <Button
                  disabled={isLoading || customerOrders.length === 0}
                  onClick={() => setIsBillModalOpen(true)}
                  type="button"
                  variant="destructive"
                >
                  Pedir a conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {isLoading ? (
          <section className="grid gap-4">
            {[0, 1].map((item) => (
              <Card
                key={item}
                className="rounded-3xl border border-primary/15 p-0 shadow-sm"
              >
                <CardHeader className="border-b border-primary/15 bg-primary-muted/35 p-6">
                  <div className="h-5 w-36 animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-4 w-56 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent className="space-y-3 p-6">
                  {[0, 1, 2].map((line) => (
                    <div
                      key={line}
                      className="rounded-2xl border border-border/70 bg-muted/25 p-4"
                    >
                      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                      <div className="mt-3 h-3 w-28 animate-pulse rounded bg-muted" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </section>
        ) : customerOrders.length ? (
          <section className="grid gap-4">
            {customerOrders.map((order) => (
              <Card
                key={order.id}
                className="rounded-3xl border border-primary/15 p-0 shadow-sm"
              >
                <CardHeader className="flex flex-col gap-3 border-b border-primary/15 bg-primary-muted/35 p-6 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Pedido {order.id}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      {formatTable(order.table)} ·{" "}
                      {formatDatetime(order.datetime)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getStatusClasses(order.status)}>
                      {order.status}
                    </Badge>
                    <strong className="text-sm">
                      {formatCurrency(order.total)}
                    </strong>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 p-6">
                  {order.items.map((item) => (
                    <div
                      key={`${order.id}-${item.productId}-${item.name}`}
                      className="rounded-2xl border border-border/70 bg-muted/25 p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Quantidade: {item.quantity}
                          </p>
                          {item.observation ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Observação: {item.observation}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-sm font-medium md:text-right">
                          <p>{formatCurrency(item.valor)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Subtotal:{" "}
                            {formatCurrency(item.valor * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </section>
        ) : (
          <Card className="rounded-3xl border border-warning/20 bg-warning-muted/35 p-2">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Nenhum pedido enviado ainda.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {isBillModalOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <Card className="max-h-[calc(100svh-2rem)] w-full max-w-2xl overflow-hidden rounded-2xl border border-primary/20 p-0 shadow-xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-primary/15 bg-primary-muted/45 p-6">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Tem certeza que deseja pedir a conta?
                </CardTitle>
                <CardDescription className="text-sm">
                  Confira os pedidos antes de finalizar o atendimento.
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsBillModalOpen(false)}
                size="icon-sm"
                title="Fechar modal"
                type="button"
                variant="ghost"
              >
                <RiCloseLine aria-hidden />
              </Button>
            </CardHeader>

            <CardContent className="max-h-[calc(100svh-12rem)] space-y-4 overflow-y-auto p-6">
              <div className="rounded-2xl border border-primary/15 bg-primary-muted/35 p-4">
                <p className="text-xs text-muted-foreground">Valor total</p>
                <strong className="mt-1 block text-2xl font-semibold">
                  {formatCurrency(total)}
                </strong>
              </div>

              <div className="space-y-3">
                {customerOrders.map((order) => (
                  <div
                    className="rounded-2xl border border-border/70 bg-muted/25 p-4"
                    key={order.id}
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-medium">Pedido {order.id}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatTable(order.table)} ·{" "}
                          {formatDatetime(order.datetime)}
                        </p>
                      </div>
                      <strong className="text-sm">
                        {formatCurrency(order.total)}
                      </strong>
                    </div>

                    <div className="mt-3 space-y-2">
                      {order.items.map((item) => (
                        <div
                          className="flex flex-col gap-1 rounded-xl bg-card/70 px-3 py-2 text-xs md:flex-row md:items-center md:justify-between"
                          key={`${order.id}-bill-${item.productId}-${item.name}`}
                        >
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.valor * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-border/70 pt-4">
                <Button
                  onClick={() => setIsBillModalOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Voltar
                </Button>
                <Button
                  onClick={confirmBillRequest}
                  type="button"
                  variant="destructive"
                >
                  Confirmar pedido da conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  )
}
