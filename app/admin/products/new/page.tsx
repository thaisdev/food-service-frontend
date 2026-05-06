import { AdminProductFormModal } from "@/components/admin-product-form-modal"
import { AdminProductsCrud } from "@/components/admin-products-crud"
import { getVisibleCategories, getVisibleProducts } from "@/lib/server-data"

export default async function NewProductPage() {
  const [products, categories] = await Promise.all([
    getVisibleProducts(),
    getVisibleCategories(),
  ])

  return (
    <>
      <AdminProductsCrud categories={categories} initialProducts={products} />
      <AdminProductFormModal categories={categories} />
    </>
  )
}
