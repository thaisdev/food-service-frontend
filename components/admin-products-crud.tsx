"use client"

import Image from "next/image"
import Link from "next/link"
import { RiAddLine, RiDeleteBinLine, RiEditLine } from "@remixicon/react"
import { useMemo, useState, useTransition } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ProductStatus,
  ProductStock,
  parseProducts,
  type Product,
} from "@/lib/data-schema"

type ProductFilter = "Todos" | "Ativos" | "Inativos" | "Baixo estoque"

type AdminProductsCrudProps = {
  initialProducts: Product[]
}

const metricColors = [
  "border-success/25 bg-success-muted/65 shadow-success/5",
  "border-primary/25 bg-primary-muted/70 shadow-primary/5",
  "border-warning/20 bg-warning-muted/45 shadow-warning/5",
]

const stockInsightColors = [
  "border-destructive/25 bg-destructive-muted/60 text-destructive",
  "border-success/25 bg-success-muted/65 text-success",
  "border-warning/25 bg-warning-muted/65 text-warning",
]

function getBadgeClasses(value: ProductStatus | ProductStock) {
  switch (value) {
    case ProductStatus.Active:
    case ProductStock.Available:
      return "bg-success-muted text-success"
    case ProductStock.Low:
      return "bg-warning-muted text-warning"
    case ProductStatus.Inactive:
    case ProductStock.Unavailable:
      return "bg-destructive-muted text-destructive"
  }
}

async function requestProducts(
  endpoint: string,
  options: RequestInit,
  fallbackProducts: Product[]
) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const message =
      ((await response.json().catch(() => null)) as { message?: string } | null)
        ?.message ?? "Não foi possível salvar os produtos."

    throw new Error(message)
  }

  return (
    parseProducts(JSON.stringify(await response.json())) ?? fallbackProducts
  )
}

export function AdminProductsCrud({ initialProducts }: AdminProductsCrudProps) {
  const [products, setProducts] = useState(initialProducts)
  const [filter, setFilter] = useState<ProductFilter>("Todos")
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredProducts = useMemo(() => {
    switch (filter) {
      case "Ativos":
        return products.filter(
          (product) => product.status === ProductStatus.Active
        )
      case "Inativos":
        return products.filter(
          (product) => product.status === ProductStatus.Inactive
        )
      case "Baixo estoque":
        return products.filter((product) => product.stock === ProductStock.Low)
      case "Todos":
        return products
    }
  }, [filter, products])

  const metrics = useMemo(() => {
    const activeProducts = products.filter(
      (product) => product.status === ProductStatus.Active
    ).length
    const lowStockProducts = products.filter(
      (product) => product.stock === ProductStock.Low
    ).length
    const categories = new Set(products.map((product) => product.category)).size

    return [
      {
        label: "Produtos ativos",
        value: String(activeProducts),
        detail: `${lowStockProducts} com estoque baixo`,
      },
      {
        label: "Categorias",
        value: String(categories),
        detail: "Cardápio principal e sazonais",
      },
      {
        label: "Itens cadastrados",
        value: String(products.length),
        detail: "Dados salvos em data/runtime/products.json",
      },
    ]
  }, [products])

  function deleteProduct(product: Product) {
    setMessage(null)

    startTransition(async () => {
      try {
        const nextProducts = await requestProducts(
          `/api/products?id=${encodeURIComponent(product.id)}`,
          { method: "DELETE" },
          products
        )

        setProducts(nextProducts)

        setMessage("Produto removido.")
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro inesperado.")
      }
    })
  }

  return (
    <main className="min-h-svh bg-[image:var(--page-gradient)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-3xl border border-primary/20 bg-card/85 p-8 shadow-sm shadow-primary/5 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-2">
              <span className="inline-flex w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Catálogo administrativo
              </span>
              <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Gerencie os produtos do cardápio
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Cadastre, edite e remova itens do catálogo com persistência no
                JSON de runtime usado pela API.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/products/new">
                <RiAddLine aria-hidden />
                Novo produto
              </Link>
            </Button>
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

        {message ? (
          <p className="rounded-md border border-primary/20 bg-primary-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {message}
          </p>
        ) : null}

        <section>
          <Card className="rounded-3xl border border-primary/15 p-0 shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b border-primary/15 bg-primary-muted/45 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Produtos cadastrados
                </CardTitle>
                <CardDescription className="text-sm">
                  Visualize, filtre e mantenha os itens disponíveis no sistema.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  ["Todos", "Ativos", "Inativos", "Baixo estoque"] as const
                ).map((currentFilter) => (
                  <Button
                    key={currentFilter}
                    onClick={() => setFilter(currentFilter)}
                    type="button"
                    variant={filter === currentFilter ? "default" : "outline"}
                  >
                    {currentFilter}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="overflow-x-auto p-0">
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
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="px-6 font-medium">
                        {product.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-64 items-center gap-3">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
                            <Image
                              alt={product.name}
                              className="object-cover"
                              fill
                              sizes="56px"
                              src={product.image}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium">{product.name}</p>
                            <p className="max-w-80 truncate text-xs text-muted-foreground">
                              {product.description}
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
                        <div className="inline-flex gap-1">
                          <Button
                            asChild
                            size="icon-sm"
                            title="Editar produto"
                            variant="ghost"
                          >
                            <Link href={`/admin/products/edit/${product.id}`}>
                              <RiEditLine aria-hidden />
                            </Link>
                          </Button>
                          <Button
                            disabled={isPending}
                            onClick={() => deleteProduct(product)}
                            size="icon-sm"
                            title="Remover produto"
                            type="button"
                            variant="destructive"
                          >
                            <RiDeleteBinLine aria-hidden />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-3xl border border-warning/20 bg-card/95 p-2 shadow-sm shadow-warning/5">
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
                ["Produtos em baixa", `${metrics[0].detail}`],
                ["Itens ativos", `${metrics[0].value} produtos no cardápio`],
                [
                  "Itens indisponíveis",
                  `${
                    products.filter(
                      (product) => product.stock === ProductStock.Unavailable
                    ).length
                  } produtos pausados`,
                ],
              ].map(([title, description], index) => (
                <div
                  key={title}
                  className={`rounded-2xl border p-4 ${stockInsightColors[index]}`}
                >
                  <h3 className="font-medium text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-current/80">{description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-success/20 bg-card/95 p-2 shadow-sm shadow-success/5">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Dados do mock
              </CardTitle>
              <CardDescription className="text-sm">
                A API usa o arquivo persistente criado dentro de data/runtime.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {[
                "GET /api/products lista os produtos",
                "POST /api/products cadastra um novo item",
                "PUT /api/products edita um item existente",
                "DELETE /api/products?id=PRD-001 remove um item",
              ].map((task) => (
                <div
                  key={task}
                  className="rounded-2xl border border-success/25 bg-success-muted/55 p-4 text-sm"
                >
                  {task}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
