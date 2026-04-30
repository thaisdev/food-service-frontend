import { NextResponse } from "next/server"

import { delay } from "@/lib/api-delay"
import { mockProducts, parseProducts } from "@/lib/data-schema"
import { readServerJsonStore } from "@/lib/server-json-store"

export const runtime = "nodejs"

export async function GET() {
  await delay()

  const products = await readServerJsonStore({
    exampleFile: "products.example.json",
    fallbackData: mockProducts,
    parse: parseProducts,
    runtimeFile: "products.json",
  })

  return NextResponse.json(products)
}
