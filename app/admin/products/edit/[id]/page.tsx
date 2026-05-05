import { redirect } from "next/navigation"

import { AdminProductFormModal } from "@/components/admin-product-form-modal"
import { AdminProductsCrud } from "@/components/admin-products-crud"
import { getProducts } from "@/lib/server-data"

type EditProductPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const products = await getProducts()
  const product = products.find((currentProduct) => currentProduct.id === id)

  if (!product) {
    redirect("/admin/products")
  }

  return (
    <>
      <AdminProductsCrud initialProducts={products} />
      <AdminProductFormModal product={product} />
    </>
  )
}
