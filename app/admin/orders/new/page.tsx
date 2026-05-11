import { AdminOrderFormModal } from "@/app/admin/orders/_components/admin-order-form-modal"
import { OrdersManager } from "@/app/admin/orders/_components/orders-manager"
import { getVisibleOrders, getVisibleProducts } from "@/lib/server-data"

export default async function NewOrderPage() {
  const [orders, products] = await Promise.all([
    getVisibleOrders(),
    getVisibleProducts(),
  ])

  return (
    <>
      <OrdersManager initialOrders={orders} />
      <AdminOrderFormModal products={products} />
    </>
  )
}
