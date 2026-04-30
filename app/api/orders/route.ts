import { NextResponse } from "next/server"

import { delay } from "@/lib/api-delay"
import { mockOrders, parseOrders } from "@/lib/data-schema"
import { readServerJsonStore } from "@/lib/server-json-store"

export const runtime = "nodejs"

export async function GET() {
  await delay()

  const orders = await readServerJsonStore({
    exampleFile: "orders.example.json",
    fallbackData: mockOrders,
    parse: parseOrders,
    runtimeFile: "orders.json",
  })

  return NextResponse.json(orders)
}
