import { redirect } from "next/navigation"

import { CategoryProductsModal } from "@/app/admin/categories/_components/category-products-modal"
import { getVisibleCategories, getVisibleProducts } from "@/lib/server-data"

type CategoryProductsModalPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function CategoryProductsModalPage({
  params,
}: CategoryProductsModalPageProps) {
  const { id } = await params
  const categoryId = decodeURIComponent(id)
  const [categories, products] = await Promise.all([
    getVisibleCategories(),
    getVisibleProducts(),
  ])
  const category = categories.find(
    (currentCategory) => currentCategory.id === categoryId
  )

  if (!category) {
    redirect("/admin/categories")
  }

  const categoryProducts = products.filter(
    (product) => product.categoryId === category.id
  )

  return (
    <CategoryProductsModal category={category} products={categoryProducts} />
  )
}
