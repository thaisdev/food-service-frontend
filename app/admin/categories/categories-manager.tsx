"use client"

import {
  RiAddLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeLine,
  RiSaveLine,
} from "@remixicon/react"
import { FormEvent, useMemo, useState, useTransition } from "react"

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
  CategoryStatus,
  ProductStatus,
  ProductStock,
  formatProductPrice,
  parseCategories,
  type Category,
  type Product,
} from "@/lib/data-schema"

type CategoryFilter = "Todas" | "Ativas" | "Inativas"

type CategoryFormData = Omit<Category, "id" | "deletedAt">

type CategoriesManagerProps = {
  initialCategories: Category[]
  initialProducts: Product[]
}

const emptyForm: CategoryFormData = {
  name: "",
  description: "",
  status: CategoryStatus.Active,
}

function getCategoryBadgeClasses(status: CategoryStatus) {
  switch (status) {
    case CategoryStatus.Active:
      return "bg-success-muted text-success"
    case CategoryStatus.Inactive:
      return "bg-destructive-muted text-destructive"
  }
}

function getProductBadgeClasses(value: ProductStatus | ProductStock) {
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

async function requestCategories(
  endpoint: string,
  options: RequestInit,
  fallbackCategories: Category[]
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
        ?.message ?? "Não foi possível salvar as categorias."

    throw new Error(message)
  }

  return (
    parseCategories(JSON.stringify(await response.json())) ??
    fallbackCategories
  )
}

export function CategoriesManager({
  initialCategories,
  initialProducts,
}: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [filter, setFilter] = useState<CategoryFilter>("Todas")
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryPendingDelete, setCategoryPendingDelete] =
    useState<Category | null>(null)
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const productCountByCategory = useMemo(() => {
    return initialProducts.reduce<Record<string, number>>((counts, product) => {
      counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1

      return counts
    }, {})
  }, [initialProducts])

  const filteredCategories = useMemo(() => {
    switch (filter) {
      case "Ativas":
        return categories.filter(
          (category) => category.status === CategoryStatus.Active
        )
      case "Inativas":
        return categories.filter(
          (category) => category.status === CategoryStatus.Inactive
        )
      case "Todas":
        return categories
    }
  }, [categories, filter])

  const viewingProducts = useMemo(() => {
    if (!viewingCategory) {
      return []
    }

    return initialProducts.filter(
      (product) => product.categoryId === viewingCategory.id
    )
  }, [initialProducts, viewingCategory])

  const pendingDeleteProducts = useMemo(() => {
    if (!categoryPendingDelete) {
      return []
    }

    return initialProducts.filter(
      (product) => product.categoryId === categoryPendingDelete.id
    )
  }, [categoryPendingDelete, initialProducts])

  function updateFormData(field: keyof CategoryFormData, value: string) {
    setFormData((currentData) => ({ ...currentData, [field]: value }))
  }

  function startCategoryCreation() {
    setMessage(null)
    setEditingCategory(null)
    setFormData(emptyForm)
    setIsFormOpen(true)
  }

  function startCategoryEdition(category: Category) {
    setMessage(null)
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      status: category.status,
    })
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingCategory(null)
    setFormData(emptyForm)
  }

  function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    const categoryData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
    }
    const payload = editingCategory
      ? { id: editingCategory.id, ...categoryData }
      : categoryData

    startTransition(async () => {
      try {
        const nextCategories = await requestCategories(
          "/api/categories",
          {
            body: JSON.stringify(payload),
            method: editingCategory ? "PUT" : "POST",
          },
          categories
        )

        setCategories(nextCategories)
        setMessage(editingCategory ? "Categoria atualizada." : "Categoria criada.")
        closeForm()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro inesperado.")
      }
    })
  }

  function confirmCategoryDeletion(category: Category) {
    setMessage(null)

    startTransition(async () => {
      try {
        const nextCategories = await requestCategories(
          `/api/categories?id=${encodeURIComponent(category.id)}`,
          { method: "DELETE" },
          categories
        )

        setCategories(nextCategories)
        setCategoryPendingDelete(null)
        setMessage("Categoria e produtos vinculados removidos.")
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro inesperado.")
        setCategoryPendingDelete(null)
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
                Gerencie as categorias do cardápio
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Cadastre, edite, pause e remova categorias usadas para organizar
                os produtos do menu.
              </p>
            </div>
            <Button onClick={startCategoryCreation} type="button" variant="outline">
              <RiAddLine aria-hidden />
              Nova categoria
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
            <CardHeader className="flex flex-col gap-4 border-b border-primary/15 bg-primary-muted/45 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Categorias cadastradas
                </CardTitle>
                <CardDescription className="text-sm">
                  Visualize o vínculo com produtos e mantenha o status de uso.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["Todas", "Ativas", "Inativas"] as const).map(
                  (currentFilter) => (
                    <Button
                      key={currentFilter}
                      onClick={() => setFilter(currentFilter)}
                      type="button"
                      variant={filter === currentFilter ? "default" : "outline"}
                    >
                      {currentFilter}
                    </Button>
                  )
                )}
              </div>
            </CardHeader>

            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Código</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Produtos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="px-6 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="px-6 font-medium">
                        {category.id}
                      </TableCell>
                      <TableCell>
                        <div className="min-w-64">
                          <p className="font-medium">{category.name}</p>
                          <p className="max-w-96 truncate text-xs text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {productCountByCategory[category.id] ?? 0}
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryBadgeClasses(category.status)}>
                          {category.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            onClick={() => setViewingCategory(category)}
                            size="icon-sm"
                            title="Ver produtos da categoria"
                            type="button"
                            variant="ghost"
                          >
                            <RiEyeLine aria-hidden />
                          </Button>
                          <Button
                            onClick={() => startCategoryEdition(category)}
                            size="icon-sm"
                            title="Editar categoria"
                            type="button"
                            variant="ghost"
                          >
                            <RiEditLine aria-hidden />
                          </Button>
                          <Button
                            disabled={isPending}
                            onClick={() => setCategoryPendingDelete(category)}
                            size="icon-sm"
                            title="Excluir categoria"
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

      {isFormOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <Card className="max-h-[calc(100svh-2rem)] w-full max-w-2xl overflow-hidden rounded-2xl border border-primary/15 p-0 shadow-xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-primary/15 bg-primary-muted/45 p-6">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {editingCategory ? "Editar categoria" : "Nova categoria"}
                </CardTitle>
                <CardDescription className="text-sm">
                  As alterações são enviadas para a API e gravadas no mock.
                </CardDescription>
              </div>
              <Button
                disabled={isPending}
                onClick={closeForm}
                size="icon-sm"
                title="Fechar modal"
                type="button"
                variant="ghost"
              >
                <RiCloseLine aria-hidden />
              </Button>
            </CardHeader>

            <CardContent className="max-h-[calc(100svh-9rem)] overflow-y-auto p-6">
              <form className="space-y-4" onSubmit={submitCategory}>
                <div className="grid gap-2">
                  <label className="text-xs font-medium" htmlFor="name">
                    Nome
                  </label>
                  <Input
                    id="name"
                    onChange={(event) =>
                      updateFormData("name", event.target.value)
                    }
                    required
                    value={formData.name}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-medium" htmlFor="description">
                    Descrição
                  </label>
                  <textarea
                    className="min-h-24 w-full rounded-md border border-input bg-input/20 px-2 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 md:text-xs/relaxed"
                    id="description"
                    onChange={(event) =>
                      updateFormData("description", event.target.value)
                    }
                    required
                    value={formData.description}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-medium" htmlFor="status">
                    Status
                  </label>
                  <select
                    className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                    id="status"
                    onChange={(event) =>
                      updateFormData("status", event.target.value)
                    }
                    value={formData.status}
                  >
                    {Object.values(CategoryStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {message ? (
                  <p className="rounded-md border border-primary/20 bg-primary-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    {message}
                  </p>
                ) : null}

                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button
                    className="bg-success text-success-foreground hover:bg-success/90"
                    disabled={isPending}
                    type="submit"
                  >
                    <RiSaveLine aria-hidden />
                    {editingCategory ? "Salvar" : "Cadastrar"}
                  </Button>
                  <Button
                    disabled={isPending}
                    onClick={closeForm}
                    type="button"
                    variant="outline"
                  >
                    <RiCloseLine aria-hidden />
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {viewingCategory ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <Card className="max-h-[calc(100svh-2rem)] w-full max-w-4xl overflow-hidden rounded-2xl border border-primary/15 p-0 shadow-xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-primary/15 bg-primary-muted/45 p-6">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Produtos em {viewingCategory.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  Itens cadastrados com esta categoria no catálogo.
                </CardDescription>
              </div>
              <Button
                onClick={() => setViewingCategory(null)}
                size="icon-sm"
                title="Fechar modal"
                type="button"
                variant="ghost"
              >
                <RiCloseLine aria-hidden />
              </Button>
            </CardHeader>

            <CardContent className="max-h-[calc(100svh-9rem)] overflow-y-auto p-0">
              {viewingProducts.length ? (
                <div className="pb-1">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Código</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead className="px-6">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="px-6 font-medium">
                            {product.id}
                          </TableCell>
                          <TableCell>
                            <div className="min-w-64">
                              <p className="font-medium">{product.name}</p>
                              <p className="max-w-96 truncate text-xs text-muted-foreground">
                                {product.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatProductPrice(product.price)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getProductBadgeClasses(product.stock)}
                            >
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6">
                            <Badge
                              className={getProductBadgeClasses(product.status)}
                            >
                              {product.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-6">
                  <p className="rounded-2xl border border-primary/15 bg-primary-muted/35 p-4 text-sm text-muted-foreground">
                    Nenhum produto vinculado a esta categoria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {categoryPendingDelete ? (
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
                  Ao excluir a categoria, os produtos vinculados também serão
                  excluídos logicamente.
                </CardDescription>
              </div>
              <Button
                disabled={isPending}
                onClick={() => setCategoryPendingDelete(null)}
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
                  {categoryPendingDelete.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {categoryPendingDelete.id} ·{" "}
                  {pendingDeleteProducts.length}{" "}
                  produtos serão removidos do catálogo
                </p>
              </div>

              {pendingDeleteProducts.length ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive-muted/35 p-4">
                  <p className="text-xs font-medium text-destructive">
                    Produtos que serão excluídos junto da categoria
                  </p>
                  <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
                    {pendingDeleteProducts.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-xl border border-border/70 bg-card/80 px-3 py-2"
                      >
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {product.id} · {formatProductPrice(product.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="rounded-2xl border border-primary/15 bg-primary-muted/35 p-4 text-sm text-muted-foreground">
                  Nenhum produto será excluído junto desta categoria.
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  disabled={isPending}
                  onClick={() => setCategoryPendingDelete(null)}
                  type="button"
                  variant="outline"
                >
                  <RiCloseLine aria-hidden />
                  Cancelar
                </Button>
                <Button
                  disabled={isPending}
                  onClick={() => confirmCategoryDeletion(categoryPendingDelete)}
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
