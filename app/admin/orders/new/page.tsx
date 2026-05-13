import { AdminOrderFormModal } from "@/app/admin/orders/_components/admin-order-form-modal"
import { OrdersManager } from "@/app/admin/orders/_components/orders-manager"
import { getVisibleOrders, getVisibleProducts } from "@/lib/server-data"

type NewOrderPageProps = {
  searchParams: Promise<{
    returnTo?: string
  }>
}

export default async function NewOrderPage({
  searchParams,
}: NewOrderPageProps) {
  const { returnTo } = await searchParams
  const closeHref = returnTo === "/admin/dashboard" ? returnTo : "/admin/orders"
  const [orders, products] = await Promise.all([
    getVisibleOrders(),
    getVisibleProducts(),
  ])

  return (
    <>
      <OrdersManager initialOrders={orders} />
      <AdminOrderFormModal closeHref={closeHref} products={products} />
    </>
  )
}
