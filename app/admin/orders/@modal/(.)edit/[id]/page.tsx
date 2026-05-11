import { redirect } from "next/navigation"

import { AdminOrderFormModal } from "@/components/admin-order-form-modal"
import { getVisibleOrders } from "@/lib/server-data"

type EditOrderModalPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditOrderModalPage({
  params,
}: EditOrderModalPageProps) {
  const { id } = await params
  const orderId = decodeURIComponent(id)
  const orders = await getVisibleOrders()
  const order = orders.find((currentOrder) => currentOrder.id === orderId)

  if (!order) {
    redirect("/admin/orders")
  }

  return <AdminOrderFormModal order={order} />
}
