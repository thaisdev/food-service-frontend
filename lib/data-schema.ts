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

export const PRODUCT_CATEGORIES = [
  "Lanches",
  "Saudável",
  "Pizzas",
  "Sobremesas",
  "Bebidas",
  "Pratos",
  "Combos",
  "Acompanhamentos",
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

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
  channel?: string
  datetime?: string
  items: OrderItem[] | string
  table?: number | string
  time?: string
}

export const mockProducts: Product[] = [
  {
    id: "PRD-001",
    image: "/branding/product-placeholder.png",
    name: "Smash Burger",
    description: "Pão brioche, burger artesanal, queijo e molho da casa.",
    categoryId: "CAT-001",
    price: 28.9,
    stock: ProductStock.Available,
    status: ProductStatus.Active,
  },
  {
    id: "PRD-002",
    image: "/branding/product-placeholder.png",
    name: "Bowl Fit",
    description: "Frango grelhado, arroz integral, legumes e molho leve.",
    categoryId: "CAT-002",
    price: 24.5,
    stock: ProductStock.Available,
    status: ProductStatus.Active,
  },
  {
    id: "PRD-003",
    image: "/branding/product-placeholder.png",
    name: "Pizza Marguerita",
    description: "Molho artesanal, muçarela, tomate fresco e manjericão.",
    categoryId: "CAT-003",
    price: 52,
    stock: ProductStock.Low,
    status: ProductStatus.Active,
  },
  {
    id: "PRD-004",
    image: "/branding/product-placeholder.png",
    name: "Brownie da Casa",
    description: "Brownie macio com calda e finalização especial.",
    categoryId: "CAT-004",
    price: 12,
    stock: ProductStock.Available,
    status: ProductStatus.Active,
  },
  {
    id: "PRD-005",
    image: "/branding/product-placeholder.png",
    name: "Suco Verde",
    description: "Suco natural com couve, limão, maçã e gengibre.",
    categoryId: "CAT-005",
    price: 9.5,
    stock: ProductStock.Unavailable,
    status: ProductStatus.Inactive,
  },
]

export const mockCategories: Category[] = [
  {
    id: "CAT-001",
    name: "Lanches",
    description: "Hambúrgueres, sanduíches e opções rápidas.",
    status: CategoryStatus.Active,
  },
  {
    id: "CAT-002",
    name: "Saudável",
    description: "Pratos leves, bowls e combinações balanceadas.",
    status: CategoryStatus.Active,
  },
  {
    id: "CAT-003",
    name: "Pizzas",
    description: "Pizzas inteiras e sabores especiais.",
    status: CategoryStatus.Active,
  },
  {
    id: "CAT-004",
    name: "Sobremesas",
    description: "Doces, bolos e finalizações da casa.",
    status: CategoryStatus.Active,
  },
  {
    id: "CAT-005",
    name: "Bebidas",
    description: "Sucos, refrigerantes, águas e bebidas geladas.",
    status: CategoryStatus.Active,
  },
  {
    id: "CAT-006",
    name: "Pratos",
    description: "Refeições completas para salão.",
    status: CategoryStatus.Active,
  },
  {
    id: "CAT-007",
    name: "Combos",
    description: "Combinações promocionais e kits do cardápio.",
    status: CategoryStatus.Active,
  },
  {
    id: "CAT-008",
    name: "Acompanhamentos",
    description: "Porções extras, entradas e complementos.",
    status: CategoryStatus.Active,
  },
]

export const mockOrders: Order[] = [
  {
    id: "#1028",
    customer: "Mariana Costa",
    table: 1,
    items: [
      {
        productId: "PRD-001",
        name: "Smash Burger",
        quantity: 2,
        valor: 28.9,
        observation: "",
      },
      {
        productId: "LEGACY-001",
        name: "Batata Rustica",
        quantity: 1,
        valor: 29.1,
        observation: "",
      },
    ],
    total: 86.9,
    status: OrderStatus.Preparing,
    datetime: "2026-05-10T12:40:00.000-03:00",
  },
  {
    id: "#1027",
    customer: "Lucas Almeida",
    table: 2,
    items: [
      {
        productId: "PRD-002",
        name: "Bowl Fit",
        quantity: 1,
        valor: 24.5,
        observation: "",
      },
      {
        productId: "PRD-005",
        name: "Suco Verde",
        quantity: 1,
        valor: 9.5,
        observation: "",
      },
    ],
    total: 34,
    status: OrderStatus.Ready,
    datetime: "2026-05-10T12:32:00.000-03:00",
  },
  {
    id: "#1026",
    customer: "Fernanda Rocha",
    table: 8,
    items: [
      {
        productId: "LEGACY-002",
        name: "Taco de Frango",
        quantity: 3,
        valor: 17,
        observation: "",
      },
      {
        productId: "LEGACY-003",
        name: "Refrigerante",
        quantity: 2,
        valor: 11,
        observation: "",
      },
    ],
    total: 73,
    status: OrderStatus.Waiting,
    datetime: "2026-05-10T12:25:00.000-03:00",
  },
  {
    id: "#1025",
    customer: "Rafael Souza",
    table: 4,
    items: [
      {
        productId: "PRD-003",
        name: "Pizza Marguerita",
        quantity: 1,
        valor: 52,
        observation: "",
      },
      {
        productId: "PRD-004",
        name: "Brownie da Casa",
        quantity: 1,
        valor: 12,
        observation: "",
      },
    ],
    total: 64,
    status: OrderStatus.Ready,
    datetime: "2026-05-10T12:18:00.000-03:00",
  },
  {
    id: "#1024",
    customer: "Carla Mendes",
    table: 3,
    items: [
      {
        productId: "LEGACY-004",
        name: "Prato Executivo",
        quantity: 2,
        valor: 34,
        observation: "",
      },
      {
        productId: "LEGACY-005",
        name: "Agua com gas",
        quantity: 2,
        valor: 12,
        observation: "",
      },
    ],
    total: 92,
    status: OrderStatus.Finished,
    datetime: "2026-05-10T12:05:00.000-03:00",
  },
]

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
    hasStringFields(value, [
      "id",
      "image",
      "name",
      "description",
    ]) &&
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
  const fallbackCategory = mockCategories.find(
    (currentCategory) => currentCategory.name === product.categoryId
  )

  return category?.id ?? fallbackCategory?.id ?? product.categoryId
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
    (typeof value.table === "number" ||
      typeof value.table === "string" ||
      typeof value.channel === "string")
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
    hasStringFields(value, [
      "id",
      "customer",
    ]) &&
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
      const product = mockProducts.find((currentProduct) =>
        name.toLocaleLowerCase("pt-BR").includes(
          currentProduct.name.toLocaleLowerCase("pt-BR")
        )
      )

      return {
        productId: product?.id ?? `LEGACY-${String(index + 1).padStart(3, "0")}`,
        name,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        valor: product?.price ?? 0,
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
    table: parseOrderTable(value.table ?? value.channel) ?? 1,
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
