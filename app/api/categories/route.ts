import { NextResponse } from "next/server"

import { delay } from "@/lib/api-delay"
import {
  CategoryStatus,
  parseCategories,
  type Category,
} from "@/lib/data-schema"
import {
  getCategories,
  saveCategories,
  getProducts,
  saveProducts,
} from "@/lib/server-data"

export const runtime = "nodejs"

function filterVisibleCategories(categories: Category[]) {
  return categories.filter((category) => !category.deletedAt)
}

function isValidCategory(category: Category) {
  return Boolean(parseCategories(JSON.stringify([category])))
}

function createCategoryId(categories: Category[]) {
  const nextNumber =
    categories.reduce((highest, category) => {
      const match = category.id.match(/^CAT-(\d+)$/)

      return match ? Math.max(highest, Number(match[1])) : highest
    }, 0) + 1

  return `CAT-${String(nextNumber).padStart(3, "0")}`
}

function createCategoryFromBody(
  body: Partial<Category>,
  id: string
): Category {
  const status: CategoryStatus = Object.values(CategoryStatus).includes(
    body.status as CategoryStatus
  )
    ? (body.status as CategoryStatus)
    : CategoryStatus.Active

  return {
    id,
    name: body.name?.trim() ?? "",
    description: body.description?.trim() ?? "",
    status,
  }
}

function hasRepeatedCategoryName(
  categories: Category[],
  category: Category
) {
  return categories.some(
    (currentCategory) =>
      currentCategory.id !== category.id &&
      !currentCategory.deletedAt &&
      currentCategory.name.toLocaleLowerCase("pt-BR") ===
        category.name.toLocaleLowerCase("pt-BR")
  )
}

async function readCategoryRequest(request: Request) {
  try {
    return (await request.json()) as Partial<Category>
  } catch {
    return null
  }
}

export async function GET() {
  await delay()

  const categories = await getCategories()

  return NextResponse.json(filterVisibleCategories(categories))
}

export async function POST(request: Request) {
  await delay()

  const body = await readCategoryRequest(request)

  if (!body) {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 })
  }

  const categories = await getCategories()
  const category = createCategoryFromBody(body, createCategoryId(categories))

  if (!isValidCategory(category)) {
    return NextResponse.json(
      { message: "Preencha os dados obrigatórios da categoria." },
      { status: 400 }
    )
  }

  if (hasRepeatedCategoryName(categories, category)) {
    return NextResponse.json(
      { message: "Já existe uma categoria com esse nome." },
      { status: 409 }
    )
  }

  const nextCategories = await saveCategories([category, ...categories])

  return NextResponse.json(filterVisibleCategories(nextCategories), {
    status: 201,
  })
}

export async function PUT(request: Request) {
  await delay()

  const body = await readCategoryRequest(request)

  if (!body?.id) {
    return NextResponse.json(
      { message: "Informe a categoria que será editada." },
      { status: 400 }
    )
  }

  const categories = await getCategories()
  const category = createCategoryFromBody(body, body.id)

  if (!isValidCategory(category)) {
    return NextResponse.json(
      { message: "Preencha os dados obrigatórios da categoria." },
      { status: 400 }
    )
  }

  if (hasRepeatedCategoryName(categories, category)) {
    return NextResponse.json(
      { message: "Já existe uma categoria com esse nome." },
      { status: 409 }
    )
  }

  let foundCategory = false
  const nextCategories = categories.map((currentCategory) => {
    if (currentCategory.id !== category.id) {
      return currentCategory
    }

    foundCategory = true

    return {
      ...category,
      deletedAt: currentCategory.deletedAt,
    }
  })

  if (!foundCategory) {
    return NextResponse.json(
      { message: "Categoria não encontrada." },
      { status: 404 }
    )
  }

  return NextResponse.json(
    filterVisibleCategories(await saveCategories(nextCategories))
  )
}

export async function DELETE(request: Request) {
  await delay()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json(
      { message: "Informe a categoria que será removida." },
      { status: 400 }
    )
  }

  const categories = await getCategories()
  const category = categories.find(
    (currentCategory) => currentCategory.id === id && !currentCategory.deletedAt
  )

  if (!category) {
    return NextResponse.json(
      { message: "Categoria não encontrada." },
      { status: 404 }
    )
  }

  const deletedAt = new Date().toISOString()
  const nextCategories = categories.map((currentCategory) =>
    currentCategory.id === id ? { ...currentCategory, deletedAt } : currentCategory
  )
  const products = await getProducts()
  const nextProducts = products.map((product) =>
    product.categoryId === category.id && !product.deletedAt
      ? { ...product, deletedAt }
      : product
  )

  await saveProducts(nextProducts)

  return NextResponse.json(filterVisibleCategories(await saveCategories(nextCategories)))
}
