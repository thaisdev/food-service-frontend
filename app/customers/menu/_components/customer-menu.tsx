"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RiShoppingCartLine } from "@remixicon/react"
import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  readCustomerCart,
  writeCustomerCart,
  type CustomerCartItem,
} from "@/app/customers/menu/_helpers/cart"
import { useCategories, useProducts } from "@/hooks/use-api-data"
import { useSessionAccess } from "@/hooks/use-session-access"
import { formatProductPrice } from "@/helpers/currency"
import { cn } from "@/lib/utils"
import {
  CategoryStatus,
  ProductStatus,
  ProductStock,
  getProductCategoryName,
  type Product,
} from "@/lib/data-schema"
import { SessionModule } from "@/lib/session-access"

const ALL_CATEGORIES_FILTER = "all"

function getCategoryFilterClasses(isSelected: boolean) {
  return cn(
    "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors",
    isSelected
      ? "border-primary bg-primary text-primary-foreground hover:bg-primary-hover"
      : "border-primary/20 bg-card text-primary hover:border-primary/35 hover:bg-primary-muted/60"
  )
}

function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function sortProductsByCategory(products: Product[], categoryIds: string[]) {
  const categoryOrder = new Map(
    categoryIds.map((categoryId, index) => [categoryId, index])
  )

  return [...products].sort((firstProduct, secondProduct) => {
    const firstCategoryOrder =
      categoryOrder.get(firstProduct.categoryId) ?? Number.MAX_SAFE_INTEGER
    const secondCategoryOrder =
      categoryOrder.get(secondProduct.categoryId) ?? Number.MAX_SAFE_INTEGER

    if (firstCategoryOrder !== secondCategoryOrder) {
      return firstCategoryOrder - secondCategoryOrder
    }

    return firstProduct.name.localeCompare(secondProduct.name, "pt-BR")
  })
}

function addProductToCart(product: Product) {
  const cartItems = readCustomerCart()
  const currentItem = cartItems.find((item) => item.productId === product.id)
  const nextCartItems = currentItem
    ? cartItems.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    : [
        ...cartItems,
        {
          productId: product.id,
          quantity: 1,
          observation: "",
        },
      ]

  writeCustomerCart(nextCartItems)
}

export function CustomerMenu() {
  const router = useRouter()
  const access = useSessionAccess()
  const categories = useCategories()
  const products = useProducts()
  const [cartItems, setCartItems] = useState<CustomerCartItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    ALL_CATEGORIES_FILTER
  )
  const [productNameFilter, setProductNameFilter] = useState("")
  const menuItems = useMemo(
    () => {
      const categoryIds = categories.map((category) => category.id)
      const availableProducts = products.filter(
        (product) =>
          product.status === ProductStatus.Active &&
          product.stock !== ProductStock.Unavailable
      )

      return sortProductsByCategory(availableProducts, categoryIds)
    },
    [categories, products]
  )
  const menuCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.status === CategoryStatus.Active &&
          menuItems.some((product) => product.categoryId === category.id)
      ),
    [categories, menuItems]
  )
  const filteredMenuItems = useMemo(
    () => {
      const normalizedProductNameFilter = normalizeSearchText(productNameFilter)

      return menuItems.filter((product) => {
        const matchesCategory =
          selectedCategoryId === ALL_CATEGORIES_FILTER ||
          product.categoryId === selectedCategoryId
        const matchesName =
          !normalizedProductNameFilter ||
          normalizeSearchText(product.name).includes(normalizedProductNameFilter)

        return matchesCategory && matchesName
      })
    },
    [menuItems, productNameFilter, selectedCategoryId]
  )
  const customerName =
    access?.module === SessionModule.Customers ? access.name : "Cliente"
  const tableNumber =
    access?.module === SessionModule.Customers ? access.table : "--"
  const cartQuantity = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  )

  useEffect(() => {
    function syncCart() {
      setCartItems(readCustomerCart())
    }

    syncCart()
    window.addEventListener("customer-cart:changed", syncCart)
    window.addEventListener("storage", syncCart)

    return () => {
      window.removeEventListener("customer-cart:changed", syncCart)
      window.removeEventListener("storage", syncCart)
    }
  }, [])

  function addItem(product: Product) {
    addProductToCart(product)
    router.push("/customers/menu/cart")
  }

  return (
    <main className="min-h-[calc(100svh-73px)] bg-[image:var(--page-gradient)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="grid gap-4">
          <Card className="rounded-3xl border border-primary/25 bg-primary-muted/45 p-2 shadow-sm shadow-primary/5">
            <CardContent className="p-4">
              <p className="text-sm text-brand-muted">Atendimento atual</p>
              <strong className="mt-2 block text-2xl font-semibold tracking-tight text-primary">
                {customerName}
              </strong>
              <p className="mt-1 text-sm text-muted-foreground">
                Mesa {tableNumber}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild className="bg-success text-success-foreground">
                  <Link href="/customers/menu/cart">
                    <RiShoppingCartLine aria-hidden />
                    Carrinho ({cartQuantity})
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/customers/orders">Meus pedidos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-3" aria-label="Filtros do cardápio">
          <Input
            aria-label="Filtrar por nome do produto"
            className="h-10 max-w-md rounded-full border-primary/20 bg-card px-4 text-sm"
            onChange={(event) => setProductNameFilter(event.target.value)}
            placeholder="Buscar produto pelo nome"
            type="search"
            value={productNameFilter}
          />

          <div className="flex flex-wrap gap-2" aria-label="Categorias">
            <button
              aria-pressed={selectedCategoryId === ALL_CATEGORIES_FILTER}
              className={getCategoryFilterClasses(
                selectedCategoryId === ALL_CATEGORIES_FILTER
              )}
              onClick={() => setSelectedCategoryId(ALL_CATEGORIES_FILTER)}
              type="button"
            >
              Todas as categorias
            </button>

            {menuCategories.map((category) => (
              <button
                aria-pressed={selectedCategoryId === category.id}
                className={getCategoryFilterClasses(
                  selectedCategoryId === category.id
                )}
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                type="button"
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredMenuItems.map((item) => (
            <Card
              key={item.id}
              className="grid grid-cols-[7rem_minmax(0,1fr)] overflow-hidden rounded-2xl border border-primary/15 p-0 shadow-sm transition-colors hover:border-success/35 md:block md:rounded-3xl"
            >
              <div className="relative min-h-32 w-full bg-muted/30 md:aspect-[4/3] md:min-h-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain p-2 md:object-cover md:p-0"
                  sizes="(max-width: 767px) 112px, (max-width: 1279px) 50vw, 25vw"
                />
              </div>

              <CardContent className="flex min-w-0 flex-col justify-between gap-3 p-4 md:gap-4 md:p-5">
                <div className="min-w-0">
                  <Badge className="bg-primary-muted text-primary">
                    {getProductCategoryName(item, categories)}
                  </Badge>
                  <CardTitle className="mt-2 text-base font-semibold md:mt-3 md:text-lg">
                    {item.name}
                  </CardTitle>
                  <CardDescription className="mt-1 line-clamp-2 text-sm leading-5 md:mt-2 md:line-clamp-none md:leading-6">
                    {item.description}
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-base font-semibold md:text-lg">
                    {formatProductPrice(item.price)}
                  </strong>
                  <Button
                    className="bg-success text-success-foreground hover:bg-green/90"
                    onClick={() => addItem(item)}
                    type="button"
                  >
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  )
}
