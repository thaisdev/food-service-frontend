import { redirect } from "next/navigation"

import { AdminProductFormModal } from "@/app/admin/products/_components/admin-product-form-modal"
import { AdminProductsCrud } from "@/app/admin/products/_components/admin-products-crud"
import { getVisibleCategories, getVisibleProducts } from "@/lib/server-data"

type EditProductPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params
  const [products, categories] = await Promise.all([
    getVisibleProducts(),
    getVisibleCategories(),
  ])
  const product = products.find((currentProduct) => currentProduct.id === id)

  if (!product) {
    redirect("/admin/products")
  }

  return (
    <>
      <AdminProductsCrud categories={categories} initialProducts={products} />
      <AdminProductFormModal categories={categories} product={product} />
    </>
  )
}
