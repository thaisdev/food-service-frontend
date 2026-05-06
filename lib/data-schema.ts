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
  OutForDelivery = "Saiu para entrega",
  Finished = "Finalizado",
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

export type Order = {
  id: string
  customer: string
  channel: string
  items: string
  total: string
  status: OrderStatus
  time: string
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
    description: "Refeições completas para salão e delivery.",
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
    channel: "Delivery",
    items: "2x Smash Burger, 1x Batata Rústica",
    total: "R$ 86,90",
    status: OrderStatus.Preparing,
    time: "12:40",
  },
  {
    id: "#1027",
    customer: "Lucas Almeida",
    channel: "Balcão",
    items: "1x Bowl Fit, 1x Suco Verde",
    total: "R$ 41,50",
    status: OrderStatus.Ready,
    time: "12:32",
  },
  {
    id: "#1026",
    customer: "Fernanda Rocha",
    channel: "Mesa 08",
    items: "3x Taco de Frango, 2x Refrigerante",
    total: "R$ 73,00",
    status: OrderStatus.Waiting,
    time: "12:25",
  },
  {
    id: "#1025",
    customer: "Rafael Souza",
    channel: "Delivery",
    items: "1x Pizza Marguerita, 1x Brownie",
    total: "R$ 64,90",
    status: OrderStatus.OutForDelivery,
    time: "12:18",
  },
  {
    id: "#1024",
    customer: "Carla Mendes",
    channel: "Mesa 03",
    items: "2x Prato Executivo, 2x Água com gás",
    total: "R$ 92,00",
    status: OrderStatus.Finished,
    time: "12:05",
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

export function formatProductPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    minimumFractionDigits: 2,
    style: "currency",
  }).format(price)
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

function isOrder(value: unknown): value is Order {
  return (
    hasStringFields(value, [
      "id",
      "customer",
      "channel",
      "items",
      "total",
      "time",
    ]) && isOneOf(value.status, Object.values(OrderStatus))
  )
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
  return parseArray(rawData, isOrder)
}

export function parseCategories(rawData: string | null) {
  return parseArray(rawData, isCategory)
}
