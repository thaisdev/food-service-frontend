import { redirect } from "next/navigation"

import { AdminProductFormModal } from "@/components/admin-product-form-modal"
import { getProducts } from "@/lib/server-data"

type EditProductModalPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductModalPage({
  params,
}: EditProductModalPageProps) {
  const { id } = await params
  const products = await getProducts()
  const product = products.find((currentProduct) => currentProduct.id === id)

  if (!product) {
    redirect("/admin/products")
  }

  return <AdminProductFormModal product={product} />
}
