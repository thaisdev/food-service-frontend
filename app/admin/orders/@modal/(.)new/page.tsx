import { AdminOrderFormModal } from "@/app/admin/orders/_components/admin-order-form-modal"
import { getVisibleCategories, getVisibleProducts } from "@/lib/server-data"

type NewOrderModalPageProps = {
  searchParams: Promise<{
    returnTo?: string
  }>
}

export default async function NewOrderModalPage({
  searchParams,
}: NewOrderModalPageProps) {
  const { returnTo } = await searchParams
  const closeHref = returnTo === "/admin/dashboard" ? returnTo : "/admin/orders"
  const [products, categories] = await Promise.all([
    getVisibleProducts(),
    getVisibleCategories(),
  ])

  return (
    <AdminOrderFormModal
      categories={categories}
      closeHref={closeHref}
      products={products}
    />
  )
}
