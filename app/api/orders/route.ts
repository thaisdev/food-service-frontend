import { NextResponse } from "next/server"

import { delay } from "@/lib/api-delay"
import { getOrders } from "@/lib/server-data"

export const runtime = "nodejs"

export async function GET() {
  await delay()

  const orders = await getOrders()

  return NextResponse.json(orders)
}
