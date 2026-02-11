import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import slugify from "slugify"

export const dynamic = 'force-dynamic'

// GET - Busca o produto com variações
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variations: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PUT - Atualiza o produto e sincroniza variações
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const body = await req.json()

  try {
    // 1️⃣ Validar se o novo slug já existe em OUTRO produto
    let slug = body.slug || slugify(body.name, { lower: true, strict: true })
    const slugConflict = await prisma.product.findFirst({
      where: { 
        slug,
        id: { not: id } // Garante que não é o próprio produto sendo editado
      }
    })

    if (slugConflict) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 5)}`
    }

    // 2️⃣ Atualizar Produto e Variações
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug,
        price: Number(body.price),
        description: body.description ?? "",
        images: body.images || [], // Agora recebe as URLs do Cloudinary
        
        // Dimensões do Produto Pai
        weight: body.weight != null ? Number(body.weight) : null,
        height: body.height != null ? Number(body.height) : null,
        width: body.width != null ? Number(body.width) : null,
        length: body.length != null ? Number(body.length) : null,
        
        active: Boolean(body.active),
        featured: Boolean(body.featured),
        bestSeller: Boolean(body.bestSeller),
        
        category: body.categoryId 
          ? { connect: { id: body.categoryId } } 
          : { disconnect: true },

        // 🔄 Sincronização de Variações
        variations: {
          deleteMany: {}, // Limpa as antigas
          create: Array.isArray(body.variations) 
            ? body.variations.map((v: any) => ({
                size: v.size || null,
                color: v.color || null,
                sku: v.sku || null,
                stock: Number(v.stock ?? 0),
                priceDiff: Number(v.priceDiff ?? 0),
              }))
            : [],
        },
      },
      include: { variations: true },
    })

    return NextResponse.json(product)
  } catch (err: any) {
    console.error("Erro ao atualizar produto:", err)
    return NextResponse.json(
      { error: err.message || "Erro ao salvar alterações" },
      { status: 500 }
    )
  }
}

// DELETE - Remove produto e dependências
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    // Se o seu schema não tiver "onDelete: Cascade", deletamos manualmente:
    await prisma.$transaction([
      prisma.variation.deleteMany({ where: { productId: id } }),
      prisma.review.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Erro ao deletar produto:", err)
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 })
  }
}