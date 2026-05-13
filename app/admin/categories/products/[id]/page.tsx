import { redirect } from "next/navigation"

import { CategoriesManager } from "@/app/admin/categories/_components/categories-manager"
import { CategoryProductsModal } from "@/app/admin/categories/_components/category-products-modal"
import { getVisibleCategories, getVisibleProducts } from "@/lib/server-data"

type CategoryProductsPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function CategoryProductsPage({
  params,
}: CategoryProductsPageProps) {
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
    <>
      <CategoriesManager
        initialCategories={categories}
        initialProducts={products}
      />
      <CategoryProductsModal category={category} products={categoryProducts} />
    </>
  )
}
