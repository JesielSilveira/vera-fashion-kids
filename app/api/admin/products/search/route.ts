import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()

  if (!q) {
    return NextResponse.json([])
  }

  const products = await prisma.product.findMany({
    where: {
      active: true,
      OR: [
        {
          name: {
            contains: q,
          },
        },
        {
          description: {
            contains: q,
          },
        },
      ],
    },
    take: 20,
  })

  return NextResponse.json(products)
}
