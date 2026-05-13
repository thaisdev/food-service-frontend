"use client"

import Image from "next/image"
import Link from "next/link"
import {
  RiAddLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEditLine,
} from "@remixicon/react"
import { useEffect, useMemo, useState, useTransition } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  getProductCategoryName,
  parseProducts,
  type Category,
  type Product,
} from "@/lib/data-schema"
import { formatProductPrice } from "@/helpers/currency"

type ProductFilter = "Todos" | "Ativos" | "Inativos" | "Baixo estoque"

const ALL_CATEGORIES_FILTER = "all"

type AdminProductsCrudProps = {
  categories: Category[]
  initialProducts: Product[]
}

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

function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

export function AdminProductsCrud({
  categories,
  initialProducts,
}: AdminProductsCrudProps) {
  const [products, setProducts] = useState(initialProducts)
  const [filter, setFilter] = useState<ProductFilter>("Todos")
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    ALL_CATEGORIES_FILTER
  )
  const [productNameFilter, setProductNameFilter] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [productPendingDelete, setProductPendingDelete] =
    useState<Product | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    function updateProducts(event: Event) {
      const productEvent = event as CustomEvent<Product[]>

      setProducts(productEvent.detail)
      setMessage(null)
    }

    window.addEventListener("admin-products:changed", updateProducts)

    return () => {
      window.removeEventListener("admin-products:changed", updateProducts)
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const normalizedProductNameFilter = normalizeSearchText(productNameFilter)

    return products.filter((product) => {
      const matchesProductFilter =
        filter === "Todos" ||
        (filter === "Ativos" && product.status === ProductStatus.Active) ||
        (filter === "Inativos" && product.status === ProductStatus.Inactive) ||
        (filter === "Baixo estoque" && product.stock === ProductStock.Low)
      const matchesCategory =
        selectedCategoryId === ALL_CATEGORIES_FILTER ||
        product.categoryId === selectedCategoryId
      const matchesName =
        !normalizedProductNameFilter ||
        normalizeSearchText(product.name).includes(normalizedProductNameFilter)

      return matchesProductFilter && matchesCategory && matchesName
    })
  }, [filter, productNameFilter, products, selectedCategoryId])

  function confirmProductDeletion(product: Product) {
    setMessage(null)
    setProductPendingDelete(null)
    setProducts((currentProducts) =>
      currentProducts.filter(
        (currentProduct) => currentProduct.id !== product.id
      )
    )

    startTransition(async () => {
      try {
        const nextProducts = await requestProducts(
          `/api/products?id=${encodeURIComponent(product.id)}`,
          { method: "DELETE" },
          products
        )

        setProducts(nextProducts)

        setMessage("Produto ocultado.")
      } catch (error) {
        setProducts(products)
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
              <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Gerencie os produtos do cardápio
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Cadastre, edite e remova itens do cardápio.
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

        {message ? (
          <p className="rounded-md border border-primary/20 bg-primary-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {message}
          </p>
        ) : null}

        <section>
          <Card className="rounded-3xl border border-primary/15 p-0 shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b border-primary/15 bg-primary-muted/45 p-6">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Produtos cadastrados
                </CardTitle>
                <CardDescription className="text-sm">
                  Visualize, filtre e mantenha os itens disponíveis no sistema.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label
                      className="text-xs font-medium"
                      htmlFor="categoryFilter"
                    >
                      Categoria
                    </label>
                    <select
                      className="h-9 min-w-48 rounded-md border border-input bg-input/20 px-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                      id="categoryFilter"
                      onChange={(event) =>
                        setSelectedCategoryId(event.target.value)
                      }
                      value={selectedCategoryId}
                    >
                      <option value={ALL_CATEGORIES_FILTER}>
                        Todas as categorias
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-1.5">
                    <label
                      className="text-xs font-medium"
                      htmlFor="productNameFilter"
                    >
                      Produto
                    </label>
                    <Input
                      className="h-9 min-w-64"
                      id="productNameFilter"
                      onChange={(event) =>
                        setProductNameFilter(event.target.value)
                      }
                      placeholder="Filtrar por nome"
                      type="search"
                      value={productNameFilter}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    ["Todos", "Ativos", "Inativos", "Baixo estoque"] as const
                  ).map((currentFilter) => (
                    <Button
                      key={currentFilter}
                      onClick={() => setFilter(currentFilter)}
                      type="button"
                      variant={
                        filter === currentFilter ? "default" : "outline"
                      }
                    >
                      {currentFilter}
                    </Button>
                  ))}
                </div>
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
                      <TableCell>
                        {getProductCategoryName(product, categories)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatProductPrice(product.price)}
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
                            onClick={() => setProductPendingDelete(product)}
                            size="icon-sm"
                            title="Ocultar produto"
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
      </div>

      {productPendingDelete ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <Card className="w-full max-w-md rounded-2xl border border-destructive/20 p-0 shadow-xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-destructive/15 bg-destructive-muted/45 p-6">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Confirmar exclusão
                </CardTitle>
                <CardDescription className="text-sm">
                  O produto será ocultado do cardápio.
                </CardDescription>
              </div>
              <Button
                disabled={isPending}
                onClick={() => setProductPendingDelete(null)}
                size="icon-sm"
                title="Fechar modal"
                type="button"
                variant="ghost"
              >
                <RiCloseLine aria-hidden />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
                <p className="text-sm font-medium">
                  {productPendingDelete.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {productPendingDelete.id} ·{" "}
                  {getProductCategoryName(productPendingDelete, categories)}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  disabled={isPending}
                  onClick={() => setProductPendingDelete(null)}
                  type="button"
                  variant="outline"
                >
                  <RiCloseLine aria-hidden />
                  Cancelar
                </Button>
                <Button
                  disabled={isPending}
                  onClick={() => confirmProductDeletion(productPendingDelete)}
                  type="button"
                  variant="destructive"
                >
                  <RiDeleteBinLine aria-hidden />
                  {isPending ? "Excluindo..." : "Excluir"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  )
}
