import { AdminOrderFormModal } from "@/app/admin/orders/_components/admin-order-form-modal"
import { getVisibleProducts } from "@/lib/server-data"

export default async function NewOrderModalPage() {
  const products = await getVisibleProducts()

  return <AdminOrderFormModal products={products} />
}
