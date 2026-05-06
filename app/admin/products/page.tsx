import { AdminProductsCrud } from "@/components/admin-products-crud"
import { getVisibleProducts } from "@/lib/server-data"

export default async function AdminProductsPage() {
  const products = await getVisibleProducts()

  return <AdminProductsCrud initialProducts={products} />
}
