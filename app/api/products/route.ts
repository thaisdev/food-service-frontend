import { NextResponse } from "next/server"

import { delay } from "@/lib/api-delay"
import {
  ProductStatus,
  ProductStock,
  parseProducts,
  type Product,
} from "@/lib/data-schema"
import { getProducts, saveProducts } from "@/lib/server-data"

export const runtime = "nodejs"

const defaultProductImage = "/branding/product-placeholder.png"

function isValidProduct(product: Product) {
  return Boolean(parseProducts(JSON.stringify([product])))
}

function createProductId(products: Product[]) {
  const nextNumber =
    products.reduce((highest, product) => {
      const match = product.id.match(/^PRD-(\d+)$/)

      return match ? Math.max(highest, Number(match[1])) : highest
    }, 0) + 1

  return `PRD-${String(nextNumber).padStart(3, "0")}`
}

function createProductFromBody(body: Partial<Product>, id: string): Product {
  const stock: ProductStock = Object.values(ProductStock).includes(
    body.stock as ProductStock
  )
    ? (body.stock as ProductStock)
    : ProductStock.Available
  const status: ProductStatus = Object.values(ProductStatus).includes(
    body.status as ProductStatus
  )
    ? (body.status as ProductStatus)
    : ProductStatus.Active

  return {
    id,
    image: body.image?.trim() || defaultProductImage,
    name: body.name?.trim() ?? "",
    description: body.description?.trim() ?? "",
    category: body.category?.trim() ?? "",
    price: body.price?.trim() ?? "",
    stock,
    status,
  }
}

async function readProductRequest(request: Request) {
  try {
    return (await request.json()) as Partial<Product>
  } catch {
    return null
  }
}

export async function GET() {
  await delay()

  const products = await getProducts()

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  await delay()

  const body = await readProductRequest(request)

  if (!body) {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 })
  }

  const products = await getProducts()
  const product = createProductFromBody(body, createProductId(products))

  if (!isValidProduct(product)) {
    return NextResponse.json(
      { message: "Preencha os dados obrigatórios do produto." },
      { status: 400 }
    )
  }

  const nextProducts = await saveProducts([product, ...products])

  return NextResponse.json(nextProducts, { status: 201 })
}

export async function PUT(request: Request) {
  await delay()

  const body = await readProductRequest(request)

  if (!body?.id) {
    return NextResponse.json(
      { message: "Informe o produto que será editado." },
      { status: 400 }
    )
  }

  const products = await getProducts()
  const product = createProductFromBody(body, body.id)

  if (!isValidProduct(product)) {
    return NextResponse.json(
      { message: "Preencha os dados obrigatórios do produto." },
      { status: 400 }
    )
  }

  let foundProduct = false
  const nextProducts = products.map((currentProduct) => {
    if (currentProduct.id !== product.id) {
      return currentProduct
    }

    foundProduct = true

    return product
  })

  if (!foundProduct) {
    return NextResponse.json(
      { message: "Produto não encontrado." },
      { status: 404 }
    )
  }

  return NextResponse.json(await saveProducts(nextProducts))
}

export async function DELETE(request: Request) {
  await delay()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json(
      { message: "Informe o produto que será removido." },
      { status: 400 }
    )
  }

  const products = await getProducts()
  const nextProducts = products.filter((product) => product.id !== id)

  if (nextProducts.length === products.length) {
    return NextResponse.json(
      { message: "Produto não encontrado." },
      { status: 404 }
    )
  }

  return NextResponse.json(await saveProducts(nextProducts))
}
