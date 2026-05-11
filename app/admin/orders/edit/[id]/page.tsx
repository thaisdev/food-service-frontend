import { redirect } from "next/navigation"

import { OrdersManager } from "@/app/admin/orders/orders-manager"
import { AdminOrderFormModal } from "@/components/admin-order-form-modal"
import { getVisibleOrders } from "@/lib/server-data"

type EditOrderPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params
  const orderId = decodeURIComponent(id)
  const orders = await getVisibleOrders()
  const order = orders.find((currentOrder) => currentOrder.id === orderId)

  if (!order) {
    redirect("/admin/orders")
  }

  return (
    <>
      <OrdersManager initialOrders={orders} />
      <AdminOrderFormModal order={order} />
    </>
  )
}
