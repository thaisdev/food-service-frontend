import Image from "next/image"

import { Button } from "@/components/ui/button"

const metrics = [
  {
    label: "Produtos ativos",
    value: "48",
    detail: "6 com estoque baixo",
  },
  {
    label: "Categorias",
    value: "8",
    detail: "Card\u00e1pio principal e sazonais",
  },
  {
    label: "Ticket m\u00e9dio",
    value: "R$ 57,40",
    detail: "+8% nesta semana",
  },
]

const products = [
  {
    id: "PRD-001",
    image: "/branding/product-placeholder.png",
    name: "Smash Burger",
    category: "Lanches",
    price: "R$ 28,90",
    stock: "Dispon\u00edvel",
    status: "Ativo",
  },
  {
    id: "PRD-002",
    image: "/branding/product-placeholder.png",
    name: "Bowl Fit",
    category: "Saud\u00e1vel",
    price: "R$ 24,50",
    stock: "Dispon\u00edvel",
    status: "Ativo",
  },
  {
    id: "PRD-003",
    image: "/branding/product-placeholder.png",
    name: "Pizza Marguerita",
    category: "Pizzas",
    price: "R$ 52,00",
    stock: "Baixo",
    status: "Ativo",
  },
  {
    id: "PRD-004",
    image: "/branding/product-placeholder.png",
    name: "Brownie da Casa",
    category: "Sobremesas",
    price: "R$ 12,00",
    stock: "Dispon\u00edvel",
    status: "Ativo",
  },
  {
    id: "PRD-005",
    image: "/branding/product-placeholder.png",
    name: "Suco Verde",
    category: "Bebidas",
    price: "R$ 9,50",
    stock: "Indispon\u00edvel",
    status: "Inativo",
  },
]

function getBadgeClasses(value: string) {
  switch (value) {
    case "Ativo":
    case "Dispon\u00edvel":
      return "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
    case "Baixo":
      return "bg-amber-500/12 text-amber-700 dark:text-amber-300"
    case "Inativo":
    case "Indispon\u00edvel":
      return "bg-rose-500/12 text-rose-700 dark:text-rose-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function AdminProductsPage() {
  return (
    <main className="min-h-svh bg-gradient-to-b from-background via-background to-muted/40 px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-card/80 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-2">
              <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {"Cat\u00e1logo administrativo"}
              </span>
              <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                {"Gerencie os produtos do card\u00e1pio"}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                {
                  "Consulte itens cadastrados, acompanhe a disponibilidade e ajuste o cat\u00e1logo da opera\u00e7\u00e3o com rapidez."
                }
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">{"Importar cat\u00e1logo"}</Button>
              <Button>Novo produto</Button>
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
              <h2 className="text-lg font-semibold">Produtos cadastrados</h2>
              <p className="text-sm text-muted-foreground">
                {"Visualize e acompanhe os itens dispon\u00edveis no sistema."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Todos", "Ativos", "Inativos", "Baixo estoque"].map(
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

          <div className="hidden grid-cols-[0.9fr_2fr_1fr_0.9fr_1fr_1fr] gap-4 px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
            <span>{"C\u00f3digo"}</span>
            <span>Produto</span>
            <span>Categoria</span>
            <span>{"Pre\u00e7o"}</span>
            <span>Estoque</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-border/70">
            {products.map((product) => (
              <article
                key={product.id}
                className="grid gap-4 px-6 py-5 md:grid-cols-[0.9fr_2fr_1fr_0.9fr_1fr_1fr] md:items-center"
              >
                <div>
                  <p className="font-medium">{product.id}</p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Categoria: {product.category}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </div>

                <div>
                  <p className="text-sm">{product.category}</p>
                </div>

                <div>
                  <p className="font-medium">{product.price}</p>
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getBadgeClasses(product.stock)}`}
                  >
                    {product.stock}
                  </span>
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getBadgeClasses(product.status)}`}
                  >
                    {product.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{"Vis\u00e3o de estoque"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {
                "Itens que pedem aten\u00e7\u00e3o do time administrativo."
              }
            </p>

            <div className="mt-6 space-y-3">
              {[
                ["Produtos em baixa", "6 itens com estoque abaixo do ideal"],
                [
                  "Mais vendidos",
                  "Smash Burger lidera nas \u00faltimas 24 horas",
                ],
                [
                  "Itens pausados",
                  "2 produtos temporariamente indispon\u00edveis",
                ],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <h3 className="font-medium">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <aside className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{"A\u00e7\u00f5es r\u00e1pidas"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {
                "Tarefas comuns para manuten\u00e7\u00e3o do cat\u00e1logo."
              }
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Cadastrar novo item promocional",
                "Atualizar pre\u00e7o dos combos",
                "Revisar produtos indispon\u00edveis",
                "Ajustar categorias do card\u00e1pio",
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
