import { redirect } from "next/navigation"

import { OrderDetailsModal } from "@/app/admin/orders/_components/order-details-modal"
import { OrdersManager } from "@/app/admin/orders/_components/orders-manager"
import { getVisibleOrders } from "@/lib/server-data"

type OrderDetailsPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    returnTo?: string
  }>
}

export default async function OrderDetailsPage({
  params,
  searchParams,
}: OrderDetailsPageProps) {
  const { id } = await params
  const { returnTo } = await searchParams
  const orderId = decodeURIComponent(id)
  const orders = await getVisibleOrders()
  const order = orders.find((currentOrder) => currentOrder.id === orderId)
  const closeHref = returnTo === "/admin/dashboard" ? returnTo : "/admin/orders"

  if (!order) {
    redirect("/admin/orders")
  }

  return (
    <>
      <OrdersManager initialOrders={orders} />
      <OrderDetailsModal closeHref={closeHref} order={order} />
    </>
  )
}
