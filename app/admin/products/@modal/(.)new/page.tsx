import { AdminProductFormModal } from "@/components/admin-product-form-modal"
import { getVisibleCategories } from "@/lib/server-data"

export default async function NewProductModalPage() {
  const categories = await getVisibleCategories()

  return <AdminProductFormModal categories={categories} />
}
