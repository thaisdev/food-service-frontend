import { OrdersManager } from "@/app/admin/orders/orders-manager"
import { getVisibleOrders, getVisibleProducts } from "@/lib/server-data"

export default async function AdminOrdersPage() {
  const [orders, products] = await Promise.all([
    getVisibleOrders(),
    getVisibleProducts(),
  ])

  return <OrdersManager initialOrders={orders} initialProducts={products} />
}
