"use client"

import {
  RiCheckboxCircleLine,
  RiMotorbikeLine,
  RiRestaurant2Line,
  RiTimeLine,
  RiTimerLine,
} from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useOrders } from "@/hooks/use-api-data"

function getStatusClasses(status: string) {
  switch (status) {
    case "Pronto":
      return "bg-success-muted text-success"
    case "Em preparo":
      return "bg-warning-muted text-warning"
    case "Saiu para entrega":
      return "bg-info-muted text-info"
    case "Finalizado":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-destructive-muted text-destructive"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "Pronto":
      return <RiCheckboxCircleLine aria-hidden className="size-3" />
    case "Em preparo":
      return <RiRestaurant2Line aria-hidden className="size-3" />
    case "Saiu para entrega":
      return <RiMotorbikeLine aria-hidden className="size-3" />
    case "Finalizado":
      return <RiCheckboxCircleLine aria-hidden className="size-3" />
    default:
      return <RiTimeLine aria-hidden className="size-3" />
  }
}

const metricColors = [
  "border-info/25 bg-info-muted/65 shadow-info/5",
  "border-success/25 bg-success-muted/65 shadow-success/5",
  "border-warning/20 bg-warning-muted/45 shadow-warning/5",
]

export default function AdminOrdersPage() {
  const orders = useOrders()
  const activeOrders = orders.filter(
    (order) => order.status !== "Finalizado"
  ).length
  const pendingOrders = orders.filter(
    (order) => order.status === "Aguardando"
  ).length
  const metrics = [
    {
      label: "Pedidos ativos",
      value: String(activeOrders),
      detail: `${pendingOrders} aguardando preparo`,
    },
    { label: "Receita do dia", value: "R$ 3.480", detail: "+12% vs. ontem" },
    {
      label: "Tempo médio",
      value: "18 min",
      detail: "Da cozinha até a entrega",
    },
  ]
  const quickSummary = [
    {
      title: "Pedidos em preparo",
      description: "8 pedidos ativos na cozinha",
      badge: "Agora",
      icon: RiRestaurant2Line,
      className: "border-warning/25 bg-warning-muted/45 text-warning",
    },
    {
      title: "Entregas em rota",
      description: "3 entregadores com pedido em andamento",
      badge: "Logística",
      icon: RiMotorbikeLine,
      className: "border-info/25 bg-info-muted/55 text-info",
    },
    {
      title: "Tempo médio de espera",
      description: "18 minutos nos últimos 30 pedidos",
      badge: "SLA",
      icon: RiTimerLine,
      className: "border-primary/25 bg-primary-muted/55 text-primary",
    },
  ]

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
                Gerencie os pedidos cadastrados em um só lugar
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Visualize os pedidos mais recentes, acompanhe o status de cada
                atendimento e mantenha a operação organizada.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">Exportar lista</Button>
              <Button>Novo pedido</Button>
            </div>
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

        <Card className="rounded-3xl border border-info/15 p-0 shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-info/15 bg-info-muted/45 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Pedidos cadastrados
              </CardTitle>
              <CardDescription className="text-sm">
                Lista operacional com os pedidos mais recentes do sistema.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Todos",
                "Aguardando",
                "Em preparo",
                "Pronto",
                "Finalizado",
              ].map((filter) => (
                <Button
                  key={filter}
                  variant={filter === "Todos" ? "default" : "outline"}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
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
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="px-6">
                      <p className="font-medium">{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.channel}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">
                        Canal: {order.channel}
                      </p>
                    </TableCell>
                    <TableCell className="min-w-72">
                      <p className="text-sm leading-6">{order.items}</p>
                    </TableCell>
                    <TableCell className="font-medium">{order.total}</TableCell>
                    <TableCell>
                      <Badge className={getStatusClasses(order.status)}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{order.time}</TableCell>
                    <TableCell className="px-6 text-right">
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-3xl border border-info/20 bg-card/95 p-2 shadow-sm shadow-info/5">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Resumo rápido
              </CardTitle>
              <CardDescription className="text-sm">
                Indicadores úteis para acompanhar a fila atual.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {quickSummary.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.title}
                    className={`flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between ${item.className}`}
                  >
                    <div className="flex items-start gap-3">
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
                    <Badge variant="secondary">{item.badge}</Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-warning/20 bg-card/95 p-2 shadow-sm shadow-warning/5">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Próximas ações
              </CardTitle>
              <CardDescription className="text-sm">
                Sugestões para o operador administrativo neste turno.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {[
                "Confirmar pedidos aguardando aprovação",
                "Despachar pedidos prontos para retirada",
                "Atualizar status dos entregadores ativos",
                "Encerrar pedidos concluídos no sistema",
              ].map((task) => (
                <label
                  key={task}
                  className="flex items-center gap-3 rounded-2xl border border-warning/20 bg-warning-muted/35 p-4 text-sm"
                >
                  <Checkbox />
                  <span>{task}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
