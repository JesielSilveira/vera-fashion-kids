import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = {
  params: {
    id: string
  }
}

// 🔹 PUT → atualizar
export async function PUT(req: Request, { params }: Params) {
  const body = await req.json()

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: body.name,
      slug: body.slug,
      price: body.price,
      images: body.image,
    },
  })

  return NextResponse.json(product)
}

// 🔹 DELETE → remover
export async function DELETE(_: Request, { params }: Params) {
  await prisma.product.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}