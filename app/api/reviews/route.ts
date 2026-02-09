export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { productId, name, rating, comment } = await req.json()

  if (!productId || !name || !rating || !comment) {
    return NextResponse.json(
      { error: "Dados inválidos" },
      { status: 400 }
    )
  }

  const review = await prisma.review.create({
    data: {
      productId,
      name,
      rating,
      comment,
    },
  })

  return NextResponse.json(review)
}
