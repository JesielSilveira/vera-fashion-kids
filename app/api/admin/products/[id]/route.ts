import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// Definimos o tipo de acordo com a nova exigência do Next.js 15
type Context = {
  params: Promise<{ id: string }>
}

// GET
export async function GET(
  req: NextRequest,
  context: Context
) {
  // ✅ CORREÇÃO: Await nos params
  const { id } = await context.params

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variations: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (err: any) {
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 })
  }
}

// PUT
export async function PUT(
  req: NextRequest,
  context: Context
) {
  // ✅ CORREÇÃO: Await nos params
  const { id } = await context.params
  const body = await req.json()

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        price: Number(body.price),
        description: body.description ?? "",
        images: Array.isArray(body.images) ? body.images : [],
        stock: Number(body.stock ?? 0),
        active: body.active ?? true,
        featured: body.featured ?? false,
        bestSeller: body.bestSeller ?? false,
        weight: body.weight != null ? Number(body.weight) : null,
        height: body.height != null ? Number(body.height) : null,
        width: body.width != null ? Number(body.width) : null,
        length: body.length != null ? Number(body.length) : null,
        categoryId: body.categoryId ?? null,
        variations: Array.isArray(body.variations)
          ? {
              deleteMany: {},
              create: body.variations.map((v: any) => ({
                size: v.size ?? null,
                color: v.color ?? null,
                stock: Number(v.stock ?? 0),
                priceDiff: Number(v.priceDiff ?? 0),
              })),
            }
          : undefined,
      },
      include: { variations: true },
    })

    return NextResponse.json(product)
  } catch (err: any) {
    console.error("Erro ao atualizar produto:", err)
    return NextResponse.json(
      { error: err.message || "Erro no servidor" },
      { status: 500 }
    )
  }
}

// DELETE
export async function DELETE(
  req: NextRequest,
  context: Context
) {
  // ✅ CORREÇÃO: Await nos params
  const { id } = await context.params

  try {
    // 🔹 Deleta dependências primeiro (ou use onDelete: Cascade no schema)
    await prisma.$transaction([
      prisma.variation.deleteMany({ where: { productId: id } }),
      prisma.review.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Erro ao deletar produto:", err)
    return NextResponse.json(
      { error: err.message || "Erro ao deletar" },
      { status: 500 }
    )
  }
}