import { AdminOrderFormModal } from "@/app/admin/orders/_components/admin-order-form-modal"
import { getVisibleProducts } from "@/lib/server-data"

export default async function DashboardNewOrderModalPage() {
  const products = await getVisibleProducts()

  return (
    <AdminOrderFormModal closeHref="/admin/dashboard" products={products} />
  )
}
