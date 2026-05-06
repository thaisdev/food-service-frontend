import { AdminProductFormModal } from "@/components/admin-product-form-modal"
import { AdminProductsCrud } from "@/components/admin-products-crud"
import { getVisibleProducts } from "@/lib/server-data"

export default async function NewProductPage() {
  const products = await getVisibleProducts()

  return (
    <>
      <AdminProductsCrud initialProducts={products} />
      <AdminProductFormModal />
    </>
  )
}
