import Image from "next/image"

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

const metrics = [
  {
    label: "Produtos ativos",
    value: "48",
    detail: "6 com estoque baixo",
  },
  {
    label: "Categorias",
    value: "8",
    detail: "Cardápio principal e sazonais",
  },
  {
    label: "Ticket médio",
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
    stock: "Disponível",
    status: "Ativo",
  },
  {
    id: "PRD-002",
    image: "/branding/product-placeholder.png",
    name: "Bowl Fit",
    category: "Saudável",
    price: "R$ 24,50",
    stock: "Disponível",
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
    stock: "Disponível",
    status: "Ativo",
  },
  {
    id: "PRD-005",
    image: "/branding/product-placeholder.png",
    name: "Suco Verde",
    category: "Bebidas",
    price: "R$ 9,50",
    stock: "Indisponível",
    status: "Inativo",
  },
]

function getBadgeClasses(value: string) {
  switch (value) {
    case "Ativo":
    case "Disponível":
      return "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
    case "Baixo":
      return "bg-amber-500/12 text-amber-700 dark:text-amber-300"
    case "Inativo":
    case "Indisponível":
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
                Catálogo administrativo
              </span>
              <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Gerencie os produtos do cardápio
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Consulte itens cadastrados, acompanhe a disponibilidade e ajuste
                o catálogo da operação com rapidez.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">Importar catálogo</Button>
              <Button>Novo produto</Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {metrics.map((item) => (
            <Card
              key={item.label}
              className="rounded-2xl border border-border/70 p-2 shadow-sm"
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

        <Card className="rounded-3xl border border-border/70 p-0 shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-border/70 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Produtos cadastrados
              </CardTitle>
              <CardDescription className="text-sm">
                Visualize e acompanhe os itens disponíveis no sistema.
              </CardDescription>
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
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="px-6 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="px-6 font-medium">
                      {product.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-56 items-center gap-3">
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
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="font-medium">
                      {product.price}
                    </TableCell>
                    <TableCell>
                      <Badge className={getBadgeClasses(product.stock)}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getBadgeClasses(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-3xl border border-border/70 p-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Visão de estoque
              </CardTitle>
              <CardDescription className="text-sm">
                Itens que pedem atenção do time administrativo.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {[
                ["Produtos em baixa", "6 itens com estoque abaixo do ideal"],
                ["Mais vendidos", "Smash Burger lidera nas últimas 24 horas"],
                ["Itens pausados", "2 produtos temporariamente indisponíveis"],
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
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border/70 p-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Ações rápidas
              </CardTitle>
              <CardDescription className="text-sm">
                Tarefas comuns para manutenção do catálogo.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {[
                "Cadastrar novo item promocional",
                "Atualizar preço dos combos",
                "Revisar produtos indisponíveis",
                "Ajustar categorias do cardápio",
              ].map((task) => (
                <label
                  key={task}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm"
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
