"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { RiCloseLine, RiSaveLine } from "@remixicon/react"
import { FormEvent, useState, useTransition } from "react"

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
  ProductStatus,
  ProductStock,
  parseProducts,
  type Product,
} from "@/lib/data-schema"

type ProductFormData = Omit<Product, "id">

type AdminProductFormModalProps = {
  product?: Product
}

const emptyForm: ProductFormData = {
  image: "/branding/product-placeholder.png",
  name: "",
  description: "",
  category: "",
  price: "",
  stock: ProductStock.Available,
  status: ProductStatus.Active,
}

async function requestProductSave(payload: ProductFormData | Product) {
  const isEditing = "id" in payload
  const response = await fetch("/api/products", {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: isEditing ? "PUT" : "POST",
  })

  if (!response.ok) {
    const message =
      ((await response.json().catch(() => null)) as { message?: string } | null)
        ?.message ?? "Não foi possível salvar o produto."

    throw new Error(message)
  }

  return parseProducts(JSON.stringify(await response.json()))
}

export function AdminProductFormModal({
  product,
}: AdminProductFormModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<ProductFormData>(
    product
      ? {
          image: product.image,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          stock: product.stock,
          status: product.status,
        }
      : emptyForm
  )
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function updateFormData(field: keyof ProductFormData, value: string) {
    setFormData((currentData) => ({ ...currentData, [field]: value }))
  }

  function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    const payload = product ? { id: product.id, ...formData } : formData

    startTransition(async () => {
      try {
        const nextProducts = await requestProductSave(payload)

        if (nextProducts) {
          window.dispatchEvent(
            new CustomEvent<Product[]>("admin-products:changed", {
              detail: nextProducts,
            })
          )
        }

        router.replace("/admin/products")
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro inesperado.")
      }
    })
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <Card className="max-h-[calc(100svh-2rem)] w-full max-w-2xl overflow-hidden rounded-2xl border border-primary/15 p-0 shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-primary/15 bg-primary-muted/45 p-6">
          <div>
            <CardTitle className="text-lg font-semibold">
              {product ? "Editar produto" : "Novo produto"}
            </CardTitle>
            <CardDescription className="text-sm">
              As alterações são enviadas para a API e gravadas no mock.
            </CardDescription>
          </div>
          <Button
            asChild
            size="icon-sm"
            title="Fechar modal"
            variant="ghost"
          >
            <Link href="/admin/products">
              <RiCloseLine aria-hidden />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="max-h-[calc(100svh-9rem)] overflow-y-auto p-6">
          <form className="space-y-4" onSubmit={submitProduct}>
            <div className="grid gap-2">
              <label className="text-xs font-medium" htmlFor="name">
                Nome
              </label>
              <Input
                id="name"
                onChange={(event) => updateFormData("name", event.target.value)}
                required
                value={formData.name}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium" htmlFor="description">
                Descrição
              </label>
              <textarea
                className="min-h-20 w-full rounded-md border border-input bg-input/20 px-2 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 md:text-xs/relaxed"
                id="description"
                onChange={(event) =>
                  updateFormData("description", event.target.value)
                }
                required
                value={formData.description}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs font-medium" htmlFor="category">
                  Categoria
                </label>
                <Input
                  id="category"
                  onChange={(event) =>
                    updateFormData("category", event.target.value)
                  }
                  required
                  value={formData.category}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium" htmlFor="price">
                  Preço
                </label>
                <Input
                  id="price"
                  onChange={(event) =>
                    updateFormData("price", event.target.value)
                  }
                  placeholder="R$ 0,00"
                  required
                  value={formData.price}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs font-medium" htmlFor="stock">
                  Estoque
                </label>
                <select
                  className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                  id="stock"
                  onChange={(event) =>
                    updateFormData("stock", event.target.value)
                  }
                  value={formData.stock}
                >
                  {Object.values(ProductStock).map((stock) => (
                    <option key={stock} value={stock}>
                      {stock}
                    </option>
                  ))}
                </select>
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
                  {Object.values(ProductStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium" htmlFor="image">
                Imagem
              </label>
              <Input
                id="image"
                onChange={(event) =>
                  updateFormData("image", event.target.value)
                }
                value={formData.image}
              />
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
                {product ? "Salvar" : "Cadastrar"}
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/products">
                  <RiCloseLine aria-hidden />
                  Cancelar
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
