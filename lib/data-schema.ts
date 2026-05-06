export enum ProductStock {
  Available = "Disponível",
  Low = "Baixo",
  Unavailable = "Indisponível",
}

export enum ProductStatus {
  Active = "Ativo",
  Inactive = "Inativo",
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
  category: string
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
    category: "Lanches",
    price: 28.9,
    stock: ProductStock.Available,
    status: ProductStatus.Active,
  },
  {
    id: "PRD-002",
    image: "/branding/product-placeholder.png",
    name: "Bowl Fit",
    description: "Frango grelhado, arroz integral, legumes e molho leve.",
    category: "Saudável",
    price: 24.5,
    stock: ProductStock.Available,
    status: ProductStatus.Active,
  },
  {
    id: "PRD-003",
    image: "/branding/product-placeholder.png",
    name: "Pizza Marguerita",
    description: "Molho artesanal, muçarela, tomate fresco e manjericão.",
    category: "Pizzas",
    price: 52,
    stock: ProductStock.Low,
    status: ProductStatus.Active,
  },
  {
    id: "PRD-004",
    image: "/branding/product-placeholder.png",
    name: "Brownie da Casa",
    description: "Brownie macio com calda e finalização especial.",
    category: "Sobremesas",
    price: 12,
    stock: ProductStock.Available,
    status: ProductStatus.Active,
  },
  {
    id: "PRD-005",
    image: "/branding/product-placeholder.png",
    name: "Suco Verde",
    description: "Suco natural com couve, limão, maçã e gengibre.",
    category: "Bebidas",
    price: 9.5,
    stock: ProductStock.Unavailable,
    status: ProductStatus.Inactive,
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

function isProduct(value: unknown): value is Product {
  return (
    hasStringFields(value, [
      "id",
      "image",
      "name",
      "description",
      "category",
    ]) &&
    parseProductPrice(value.price) !== null &&
    isOneOf(value.stock, Object.values(ProductStock)) &&
    isOneOf(value.status, Object.values(ProductStatus)) &&
    (!isRecord(value) ||
      value.deletedAt === undefined ||
      typeof value.deletedAt === "string")
  )
}

function normalizeProduct(value: unknown): Product | null {
  if (!isProduct(value)) {
    return null
  }

  return {
    ...value,
    price: parseProductPrice(value.price) ?? 0,
  }
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
