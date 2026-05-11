import { redirect } from "next/navigation"

import { AdminProductFormModal } from "@/app/admin/products/_components/admin-product-form-modal"
import { getVisibleCategories, getVisibleProducts } from "@/lib/server-data"

type EditProductModalPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductModalPage({
  params,
}: EditProductModalPageProps) {
  const { id } = await params
  const [products, categories] = await Promise.all([
    getVisibleProducts(),
    getVisibleCategories(),
  ])
  const product = products.find((currentProduct) => currentProduct.id === id)

  if (!product) {
    redirect("/admin/products")
  }

  return <AdminProductFormModal categories={categories} product={product} />
}
