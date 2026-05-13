import { redirect } from "next/navigation"

import { AdminOrderFormModal } from "@/app/admin/orders/_components/admin-order-form-modal"
import { OrdersManager } from "@/app/admin/orders/_components/orders-manager"
import { OrderStatus } from "@/lib/data-schema"
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

  if (
    !order ||
    [OrderStatus.Canceled, OrderStatus.Finished].includes(order.status)
  ) {
    redirect("/admin/orders")
  }

  return (
    <>
      <OrdersManager initialOrders={orders} />
      <AdminOrderFormModal order={order} />
    </>
  )
}
