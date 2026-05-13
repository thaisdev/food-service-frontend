import { CategoriesManager } from "@/app/admin/categories/_components/categories-manager"
import { getVisibleCategories, getVisibleProducts } from "@/lib/server-data"

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    getVisibleCategories(),
    getVisibleProducts(),
  ])

  return (
    <CategoriesManager
      initialCategories={categories}
      initialProducts={products}
    />
  )
}
