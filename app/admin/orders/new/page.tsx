import { AdminOrderFormModal } from "@/app/admin/orders/_components/admin-order-form-modal"
import { OrdersManager } from "@/app/admin/orders/_components/orders-manager"
import {
  getVisibleCategories,
  getVisibleOrders,
  getVisibleProducts,
} from "@/lib/server-data"

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
  const [orders, products, categories] = await Promise.all([
    getVisibleOrders(),
    getVisibleProducts(),
    getVisibleCategories(),
  ])

  return (
    <>
      <OrdersManager initialOrders={orders} />
      <AdminOrderFormModal
        categories={categories}
        closeHref={closeHref}
        products={products}
      />
    </>
  )
}
