import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

// 🔹 PUT → atualizar
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ⚠️ params é Promise
) {
  const { id } = await context.params // precisa do await
  const body = await req.json()

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      price: body.price,
      images: body.images, // ⚠️ se for array
    },
  })

  return NextResponse.json(product)
}

// 🔹 DELETE → remover
export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  await prisma.product.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
