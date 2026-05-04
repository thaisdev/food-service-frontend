import { AdminProductsCrud } from "@/components/admin-products-crud"
import { getProducts } from "@/lib/server-data"

export default async function AdminProductsPage() {
  const products = await getProducts()

  return <AdminProductsCrud initialProducts={products} />
}
