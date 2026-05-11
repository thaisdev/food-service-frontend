import { OrdersManager } from "@/app/admin/orders/orders-manager"
import { getVisibleOrders } from "@/lib/server-data"

export default async function AdminOrdersPage() {
  const orders = await getVisibleOrders()

  return <OrdersManager initialOrders={orders} />
}
