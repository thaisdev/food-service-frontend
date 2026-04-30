import Image from "next/image"

import { Button } from "@/components/ui/button"

const menuItems = [
  {
    id: "MENU-001",
    image: "/branding/product-placeholder.png",
    name: "Smash Burger",
    description: "Pão brioche, burger artesanal, queijo e molho da casa.",
    price: "R$ 28,90",
    category: "Lanches",
  },
  {
    id: "MENU-002",
    image: "/branding/product-placeholder.png",
    name: "Bowl Fit",
    description: "Frango grelhado, arroz integral, legumes e molho leve.",
    price: "R$ 24,50",
    category: "Saudável",
  },
  {
    id: "MENU-003",
    image: "/branding/product-placeholder.png",
    name: "Pizza Marguerita",
    description: "Molho artesanal, muçarela, tomate fresco e manjericão.",
    price: "R$ 52,00",
    category: "Pizzas",
  },
  {
    id: "MENU-004",
    image: "/branding/product-placeholder.png",
    name: "Brownie da Casa",
    description: "Brownie macio com calda e finalização especial.",
    price: "R$ 12,00",
    category: "Sobremesas",
  },
]

type CustomersMenuPageProps = {
  searchParams?: Promise<{
    name?: string
    table?: string
  }>
}

export default async function CustomersMenuPage({
  searchParams,
}: CustomersMenuPageProps) {
  const params = (await searchParams) ?? {}
  const customerName = params.name?.trim() || "Cliente"
  const tableNumber = params.table?.trim() || "--"

  return (
    <main className="min-h-[calc(100svh-73px)] bg-gradient-to-b from-background via-background to-muted/40 px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-3xl border border-border/70 bg-card/90 p-8 shadow-sm">
            <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Módulo do cliente
            </span>
            <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Cardápio digital e pedidos
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Escolha os produtos do seu pedido, acompanhe os destaques da casa
              e envie tudo direto para a equipe de atendimento.
            </p>
          </article>

          <aside className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Atendimento atual</p>
            <strong className="mt-2 block text-2xl font-semibold tracking-tight">
              {customerName}
            </strong>
            <p className="mt-1 text-sm text-muted-foreground">
              Mesa {tableNumber}
            </p>

            <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-4">
              <p className="text-sm font-medium">Sugestão do dia</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Combine um prato principal com bebida e sobremesa para montar um
                pedido completo.
              </p>
            </div>
          </aside>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {menuItems.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm"
            >
              <div className="relative aspect-[4/3] w-full bg-muted/30">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1279px) 50vw, 25vw"
                />
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {item.category}
                  </span>
                  <h2 className="mt-3 text-lg font-semibold">{item.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <strong className="text-lg font-semibold">{item.price}</strong>
                  <Button>Adicionar</Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
