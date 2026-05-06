import { NextResponse } from "next/server"

import { delay } from "@/lib/api-delay"
import { getProducts } from "@/lib/server-data"

export const runtime = "nodejs"

export async function GET() {
  await delay()

  const products = await getProducts()

  return NextResponse.json(products)
}
