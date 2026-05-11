"use client"

import Link from "next/link"

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
import { SessionModule } from "@/lib/session-access"

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
  const access = useSessionAccess()
  const { isLoading, orders } = useOrders()
  const customerOrders = filterCustomerOrders(orders, access)
  const total = customerOrders.reduce((sum, order) => sum + order.total, 0)
  const customerName =
    access?.module === SessionModule.Customers ? access.name : "Cliente"

  return (
    <main className="min-h-[calc(100svh-73px)] bg-[image:var(--page-gradient)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-3xl border border-success/20 bg-card/90 p-8 shadow-sm shadow-success/5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-2">
            <Badge className="bg-success text-success-foreground">
              Módulo do cliente
            </Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Meus pedidos
            </h1>
            <p className="text-sm leading-6 text-muted-foreground md:text-base">
              Consulte os pedidos enviados por {customerName}, com status,
              itens, observações e totais.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/customers/menu">Voltar ao cardápio</Link>
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl border border-info/25 bg-info-muted/55 p-2">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pedidos enviados</p>
              <strong className="mt-3 block text-3xl font-semibold">
                {customerOrders.length}
              </strong>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-success/25 bg-success-muted/55 p-2">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total consumido</p>
              <strong className="mt-3 block text-3xl font-semibold">
                {formatCurrency(total)}
              </strong>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-warning/25 bg-warning-muted/55 p-2">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Em andamento</p>
              <strong className="mt-3 block text-3xl font-semibold">
                {
                  customerOrders.filter(
                    (order) => order.status !== OrderStatus.Finished
                  ).length
                }
              </strong>
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
    </main>
  )
}
