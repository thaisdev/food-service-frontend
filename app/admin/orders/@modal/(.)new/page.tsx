import { AdminOrderFormModal } from "@/components/admin-order-form-modal"
import { getVisibleProducts } from "@/lib/server-data"

export default async function NewOrderModalPage() {
  const products = await getVisibleProducts()

  return <AdminOrderFormModal products={products} />
}
