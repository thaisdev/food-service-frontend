export enum ProductStock {
  Available = "Disponível",
  Low = "Baixo",
  Unavailable = "Indisponível",
}

export enum ProductStatus {
  Active = "Ativo",
  Inactive = "Inativo",
}

export enum CategoryStatus {
  Active = "Ativa",
  Inactive = "Inativa",
}

export type Category = {
  id: string
  name: string
  description: string
  status: CategoryStatus
  deletedAt?: string
}

export enum OrderStatus {
  Waiting = "Aguardando",
  Preparing = "Em preparo",
  Ready = "Pronto",
  Finished = "Finalizado",
  Canceled = "Cancelado",
}

export type Product = {
  id: string
  image: string
  name: string
  description: string
  categoryId: string
  price: number
  stock: ProductStock
  status: ProductStatus
  deletedAt?: string
}

export type OrderItem = {
  productId: string
  name: string
  quantity: number
  valor: number
  observation: string
}

export type Order = {
  id: string
  customer: string
  table: number
  items: OrderItem[]
  total: number
  status: OrderStatus
  datetime: string
  deletedAt?: string
}

type RawOrder = Omit<Order, "items"> & {
  datetime?: string
  items: OrderItem[] | string
  table?: number | string
  time?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function hasStringFields(
  value: unknown,
  fields: string[]
): value is Record<string, string> {
  return (
    isRecord(value) && fields.every((field) => typeof value[field] === "string")
  )
}

function isOneOf<T extends string>(
  value: unknown,
  values: readonly T[]
): value is T {
  return typeof value === "string" && values.includes(value as T)
}

export function parseProductPrice(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : null
  }

  if (typeof value !== "string") {
    return null
  }

  const sanitizedValue = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".")

  if (!sanitizedValue) {
    return null
  }

  const price = Number(sanitizedValue)

  return Number.isFinite(price) && price >= 0 ? price : null
}

function hasProductCategoryField(value: unknown) {
  return (
    isRecord(value) &&
    (typeof value.categoryId === "string" || typeof value.category === "string")
  )
}

function isProduct(value: unknown): value is Product {
  return (
    hasStringFields(value, ["id", "image", "name", "description"]) &&
    hasProductCategoryField(value) &&
    parseProductPrice(value.price) !== null &&
    isOneOf(value.stock, Object.values(ProductStock)) &&
    isOneOf(value.status, Object.values(ProductStatus)) &&
    (!isRecord(value) ||
      value.deletedAt === undefined ||
      typeof value.deletedAt === "string")
  )
}

function isCategory(value: unknown): value is Category {
  return (
    hasStringFields(value, ["id", "name", "description"]) &&
    isOneOf(value.status, Object.values(CategoryStatus)) &&
    (!isRecord(value) ||
      value.deletedAt === undefined ||
      typeof value.deletedAt === "string")
  )
}

function isOrderItem(value: unknown): value is OrderItem {
  return (
    hasStringFields(value, ["productId", "name", "observation"]) &&
    isRecord(value) &&
    typeof value.quantity === "number" &&
    Number.isFinite(value.quantity) &&
    value.quantity > 0 &&
    typeof value.valor === "number" &&
    Number.isFinite(value.valor) &&
    value.valor >= 0
  )
}

function normalizeProduct(value: unknown): Product | null {
  if (!isProduct(value)) {
    return null
  }

  const categoryId =
    "categoryId" in value && typeof value.categoryId === "string"
      ? value.categoryId
      : "category" in value && typeof value.category === "string"
        ? value.category
        : ""

  return {
    id: value.id,
    image: value.image,
    name: value.name,
    description: value.description,
    categoryId,
    price: parseProductPrice(value.price) ?? 0,
    stock: value.stock,
    status: value.status,
    deletedAt: value.deletedAt,
  }
}

export function resolveProductCategoryId(
  product: Product,
  categories: Category[]
) {
  const category = categories.find(
    (currentCategory) =>
      currentCategory.id === product.categoryId ||
      currentCategory.name === product.categoryId
  )

  return category?.id ?? product.categoryId
}

export function getProductCategoryName(
  product: Product,
  categories: Category[]
) {
  return (
    categories.find((category) => category.id === product.categoryId)?.name ??
    categories.find((category) => category.name === product.categoryId)?.name ??
    product.categoryId
  )
}

function hasOrderItemsField(value: unknown) {
  return (
    isRecord(value) &&
    (typeof value.items === "string" ||
      (Array.isArray(value.items) && value.items.every(isOrderItem)))
  )
}

function hasOrderDatetimeField(value: unknown) {
  return (
    isRecord(value) &&
    (typeof value.datetime === "string" || typeof value.time === "string")
  )
}

function hasOrderTableField(value: unknown) {
  return (
    isRecord(value) &&
    (typeof value.table === "number" || typeof value.table === "string")
  )
}

function parseOrderTable(value: unknown) {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null
  }

  if (typeof value !== "string") {
    return null
  }

  const match = value.match(/\d+/)

  if (!match) {
    return null
  }

  const table = Number(match[0])

  return Number.isInteger(table) && table > 0 ? table : null
}

function normalizeLegacyOrderDatetime(value: string) {
  if (value.includes("T")) {
    return value
  }

  const dateTimeMatch = value.match(
    /^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})$/
  )

  if (dateTimeMatch) {
    const [, day, month, year, hour, minute] = dateTimeMatch

    return `${year}-${month}-${day}T${hour}:${minute}:00.000-03:00`
  }

  const timeMatch = value.match(/^(\d{2}):(\d{2})$/)

  if (timeMatch) {
    const [, hour, minute] = timeMatch

    return `2026-05-10T${hour}:${minute}:00.000-03:00`
  }

  return value
}

function isOrder(value: unknown): value is RawOrder {
  return (
    hasStringFields(value, ["id", "customer"]) &&
    hasOrderTableField(value) &&
    hasOrderItemsField(value) &&
    hasOrderDatetimeField(value) &&
    isRecord(value) &&
    parseProductPrice(value.total) !== null &&
    isOneOf(value.status, Object.values(OrderStatus)) &&
    (!isRecord(value) ||
      value.deletedAt === undefined ||
      typeof value.deletedAt === "string")
  )
}

function normalizeLegacyOrderItems(items: string): OrderItem[] {
  return items
    .split(",")
    .map((item, index) => {
      const trimmedItem = item.trim()
      const match = trimmedItem.match(/^(\d+)x\s+(.+?)(?:\s+\((.*)\))?$/)
      const quantity = match ? Number(match[1]) : 1
      const name = match?.[2]?.trim() || trimmedItem

      return {
        productId: `LEGACY-${String(index + 1).padStart(3, "0")}`,
        name,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        valor: 0,
        observation: match?.[3]?.trim() ?? "",
      }
    })
    .filter((item) => item.name)
}

function normalizeOrder(value: unknown): Order | null {
  if (!isOrder(value)) {
    return null
  }

  return {
    id: value.id,
    customer: value.customer,
    table: parseOrderTable(value.table) ?? 1,
    items:
      typeof value.items === "string"
        ? normalizeLegacyOrderItems(value.items)
        : value.items,
    total: parseProductPrice(value.total) ?? 0,
    status: value.status,
    datetime: normalizeLegacyOrderDatetime(value.datetime ?? value.time ?? ""),
    deletedAt: value.deletedAt,
  }
}

function parseArray<T>(
  rawData: string | null,
  isItem: (value: unknown) => value is T
) {
  if (!rawData) {
    return null
  }

  try {
    const data = JSON.parse(rawData) as unknown

    if (Array.isArray(data) && data.every(isItem)) {
      return data
    }
  } catch {
    return null
  }

  return null
}

export function parseProducts(rawData: string | null) {
  if (!rawData) {
    return null
  }

  try {
    const data = JSON.parse(rawData) as unknown

    if (!Array.isArray(data)) {
      return null
    }

    const products = data
      .map((item) => normalizeProduct(item))
      .filter((item): item is Product => item !== null)

    return products.length === data.length ? products : null
  } catch {
    return null
  }
}

export function parseOrders(rawData: string | null) {
  if (!rawData) {
    return null
  }

  try {
    const data = JSON.parse(rawData) as unknown

    if (!Array.isArray(data)) {
      return null
    }

    const orders = data
      .map((item) => normalizeOrder(item))
      .filter((item): item is Order => item !== null)

    return orders.length === data.length ? orders : null
  } catch {
    return null
  }
}

export function parseCategories(rawData: string | null) {
  return parseArray(rawData, isCategory)
}
