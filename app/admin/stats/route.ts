import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const orders = await prisma.order.findMany({
    where: { status: "paid" },
    orderBy: { createdAt: "asc" },
  })

  const byDay: Record<string, number> = {}

  for (const order of orders) {
    const day = order.createdAt.toISOString().slice(0, 10)
    byDay[day] = (byDay[day] || 0) + order.total
  }

  return NextResponse.json(byDay)
}
