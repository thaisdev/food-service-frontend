import { Button } from "@/components/ui/button"

const metrics = [
  { label: "Pedidos ativos", value: "24", detail: "6 aguardando preparo" },
  { label: "Receita do dia", value: "R$ 3.480", detail: "+12% vs. ontem" },
  { label: "Tempo médio", value: "18 min", detail: "Da cozinha até a entrega" },
]

const orders = [
  {
    id: "#1028",
    customer: "Mariana Costa",
    channel: "Delivery",
    items: "2x Smash Burger, 1x Batata Rústica",
    total: "R$ 86,90",
    status: "Em preparo",
    time: "12:40",
  },
  {
    id: "#1027",
    customer: "Lucas Almeida",
    channel: "Balcão",
    items: "1x Bowl Fit, 1x Suco Verde",
    total: "R$ 41,50",
    status: "Pronto",
    time: "12:32",
  },
  {
    id: "#1026",
    customer: "Fernanda Rocha",
    channel: "Mesa 08",
    items: "3x Taco de Frango, 2x Refrigerante",
    total: "R$ 73,00",
    status: "Aguardando",
    time: "12:25",
  },
  {
    id: "#1025",
    customer: "Rafael Souza",
    channel: "Delivery",
    items: "1x Pizza Marguerita, 1x Brownie",
    total: "R$ 64,90",
    status: "Saiu para entrega",
    time: "12:18",
  },
  {
    id: "#1024",
    customer: "Carla Mendes",
    channel: "Mesa 03",
    items: "2x Prato Executivo, 2x Água com gás",
    total: "R$ 92,00",
    status: "Finalizado",
    time: "12:05",
  },
]

function getStatusClasses(status: string) {
  switch (status) {
    case "Pronto":
      return "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
    case "Em preparo":
      return "bg-amber-500/12 text-amber-700 dark:text-amber-300"
    case "Saiu para entrega":
      return "bg-sky-500/12 text-sky-700 dark:text-sky-300"
    case "Finalizado":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-rose-500/12 text-rose-700 dark:text-rose-300"
  }
}

export default function AdminOrdersPage() {
  return (
    <main className="min-h-svh bg-gradient-to-b from-background via-background to-muted/40 px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-card/80 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-2">
              <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
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
          {metrics.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
            >
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <strong className="mt-3 block text-3xl font-semibold tracking-tight">
                {item.value}
              </strong>
              <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-border/70 bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border/70 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Pedidos cadastrados</h2>
              <p className="text-sm text-muted-foreground">
                Lista operacional com os pedidos mais recentes do sistema.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Todos", "Aguardando", "Em preparo", "Pronto", "Finalizado"].map(
                (filter) => (
                  <Button
                    key={filter}
                    variant={filter === "Todos" ? "default" : "outline"}
                  >
                    {filter}
                  </Button>
                )
              )}
            </div>
          </div>

          <div className="hidden grid-cols-[0.9fr_1.2fr_2fr_0.9fr_1fr_0.8fr] gap-4 px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
            <span>Pedido</span>
            <span>Cliente</span>
            <span>Itens</span>
            <span>Total</span>
            <span>Status</span>
            <span>Hora</span>
          </div>

          <div className="divide-y divide-border/70">
            {orders.map((order) => (
              <article
                key={order.id}
                className="grid gap-4 px-6 py-5 md:grid-cols-[0.9fr_1.2fr_2fr_0.9fr_1fr_0.8fr] md:items-center"
              >
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.channel}</p>
                </div>

                <div>
                  <p className="font-medium">{order.customer}</p>
                  <p className="text-xs text-muted-foreground">
                    Canal: {order.channel}
                  </p>
                </div>

                <div>
                  <p className="text-sm leading-6">{order.items}</p>
                </div>

                <div>
                  <p className="font-medium">{order.total}</p>
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 md:block">
                  <p className="font-medium">{order.time}</p>
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Resumo rápido</h2>
                <p className="text-sm text-muted-foreground">
                  Indicadores úteis para acompanhar a fila atual.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                ["Pedidos em preparo", "8 pedidos ativos na cozinha", "Agora"],
                [
                  "Entregas em rota",
                  "3 entregadores com pedido em andamento",
                  "Logística",
                ],
                [
                  "Tempo médio de espera",
                  "18 minutos nos últimos 30 pedidos",
                  "SLA",
                ],
              ].map(([title, description, badge]) => (
                <div
                  key={title}
                  className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="font-medium">{title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <aside className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Próximas ações</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sugestões para o operador administrativo neste turno.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Confirmar pedidos aguardando aprovação",
                "Despachar pedidos prontos para retirada",
                "Atualizar status dos entregadores ativos",
                "Encerrar pedidos concluídos no sistema",
              ].map((task) => (
                <label
                  key={task}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span>{task}</span>
                </label>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
