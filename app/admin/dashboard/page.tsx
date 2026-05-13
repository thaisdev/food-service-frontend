import { AdminDashboard } from "@/app/admin/dashboard/_components/admin-dashboard"
import { getVisibleOrders, getVisibleProducts } from "@/lib/server-data"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminDashboardPage() {
  const [orders, products] = await Promise.all([
    getVisibleOrders(),
    getVisibleProducts(),
  ])

  return <AdminDashboard initialOrders={orders} products={products} />
}
