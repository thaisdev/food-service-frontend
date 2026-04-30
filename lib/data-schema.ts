export type Product = {
  id: string
  image: string
  name: string
  description: string
  category: string
  price: string
  stock: string
  status: string
}

export type Order = {
  id: string
  customer: string
  channel: string
  items: string
  total: string
  status: string
  time: string
}

export const mockProducts: Product[] = [
  {
    id: "PRD-001",
    image: "/branding/product-placeholder.png",
    name: "Smash Burger",
    description: "Pão brioche, burger artesanal, queijo e molho da casa.",
    category: "Lanches",
    price: "R$ 28,90",
    stock: "Disponível",
    status: "Ativo",
  },
  {
    id: "PRD-002",
    image: "/branding/product-placeholder.png",
    name: "Bowl Fit",
    description: "Frango grelhado, arroz integral, legumes e molho leve.",
    category: "Saudável",
    price: "R$ 24,50",
    stock: "Disponível",
    status: "Ativo",
  },
  {
    id: "PRD-003",
    image: "/branding/product-placeholder.png",
    name: "Pizza Marguerita",
    description: "Molho artesanal, muçarela, tomate fresco e manjericão.",
    category: "Pizzas",
    price: "R$ 52,00",
    stock: "Baixo",
    status: "Ativo",
  },
  {
    id: "PRD-004",
    image: "/branding/product-placeholder.png",
    name: "Brownie da Casa",
    description: "Brownie macio com calda e finalização especial.",
    category: "Sobremesas",
    price: "R$ 12,00",
    stock: "Disponível",
    status: "Ativo",
  },
  {
    id: "PRD-005",
    image: "/branding/product-placeholder.png",
    name: "Suco Verde",
    description: "Suco natural com couve, limão, maçã e gengibre.",
    category: "Bebidas",
    price: "R$ 9,50",
    stock: "Indisponível",
    status: "Inativo",
  },
]

export const mockOrders: Order[] = [
  {
    id: "#1028",
    customer: "Mariana Costa",
    channel: "Delivery",
    items: "2x Smash Burger, 1x Batata Rústica",
    total: "R$ 86,90",
    status: "Em preparo",
    time: "12:40",
  },
  {
    id: "#1027",
    customer: "Lucas Almeida",
    channel: "Balcão",
    items: "1x Bowl Fit, 1x Suco Verde",
    total: "R$ 41,50",
    status: "Pronto",
    time: "12:32",
  },
  {
    id: "#1026",
    customer: "Fernanda Rocha",
    channel: "Mesa 08",
    items: "3x Taco de Frango, 2x Refrigerante",
    total: "R$ 73,00",
    status: "Aguardando",
    time: "12:25",
  },
  {
    id: "#1025",
    customer: "Rafael Souza",
    channel: "Delivery",
    items: "1x Pizza Marguerita, 1x Brownie",
    total: "R$ 64,90",
    status: "Saiu para entrega",
    time: "12:18",
  },
  {
    id: "#1024",
    customer: "Carla Mendes",
    channel: "Mesa 03",
    items: "2x Prato Executivo, 2x Água com gás",
    total: "R$ 92,00",
    status: "Finalizado",
    time: "12:05",
  },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function hasStringFields(value: unknown, fields: string[]) {
  return (
    isRecord(value) && fields.every((field) => typeof value[field] === "string")
  )
}

function isProduct(value: unknown): value is Product {
  return hasStringFields(value, [
    "id",
    "image",
    "name",
    "description",
    "category",
    "price",
    "stock",
    "status",
  ])
}

function isOrder(value: unknown): value is Order {
  return hasStringFields(value, [
    "id",
    "customer",
    "channel",
    "items",
    "total",
    "status",
    "time",
  ])
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
  return parseArray(rawData, isProduct)
}

export function parseOrders(rawData: string | null) {
  return parseArray(rawData, isOrder)
}
