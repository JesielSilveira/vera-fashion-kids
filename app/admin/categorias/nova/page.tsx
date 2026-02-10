import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import slugify from "slugify"

/* =========================
   GET - Listar categorias
========================= */
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })
  return NextResponse.json(categories)
}

/* =========================
   POST - Criar categoria
========================= */
export async function POST(req: Request) {
  try {
    const data = await req.json()
    const name = data.name?.toString().trim()
    const slug = data.slug?.toString().trim() || slugify(name ?? "", { lower: true, strict: true })
    const active = Boolean(data.active)
    const image = data.image?.toString() || null // base64 da imagem

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: { name, slug, active, image },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (err: any) {
    console.error("Erro ao criar categoria:", err)
    return NextResponse.json({ error: err.message || "Erro ao criar categoria" }, { status: 500 })
  }
}

/* =========================
   PUT - Atualizar categoria
========================= */
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const data = await req.json()
    const name = data.name?.toString().trim()
    const slug = data.slug?.toString().trim() || slugify(name ?? "", { lower: true, strict: true })
    const active = Boolean(data.active)
    const image = data.image?.toString() || undefined // se não tiver, não altera

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, active, ...(image ? { image } : {}) },
    })

    return NextResponse.json(category)
  } catch (err: any) {
    console.error("Erro ao atualizar categoria:", err)
    return NextResponse.json({ error: err.message || "Erro ao atualizar categoria" }, { status: 500 })
  }
}

/* =========================
   DELETE - Excluir categoria
========================= */
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    // Verifica se há produtos relacionados
    const relatedProducts = await prisma.product.count({ where: { categoryId: id } })
    if (relatedProducts > 0) {
      return NextResponse.json(
        { error: "Categoria possui produtos relacionados" },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Erro ao deletar categoria:", err)
    return NextResponse.json({ error: err.message || "Erro ao deletar categoria" }, { status: 500 })
  }
}
