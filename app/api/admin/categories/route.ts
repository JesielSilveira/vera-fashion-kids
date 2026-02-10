export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"
import slugify from "slugify"

/* =========================
   GET - listar categorias
========================= */
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  return NextResponse.json(categories)
}

/* =========================
   POST - criar categoria
========================= */
export async function POST(req: Request) {
  try {
    const data = await req.formData()

    const file = data.get("file") as File | null
    const name = data.get("name") as string
    const active = data.get("active") === "true"
    let slug = (data.get("slug") as string) || slugify(name, { lower: true, strict: true })

    let imagePath: string | null = null

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = Date.now() + "-" + file.name.replace(/\s/g, "_")
      const filePath = path.join(process.cwd(), "public/uploads", fileName)
      await writeFile(filePath, buffer)
      imagePath = `/uploads/${fileName}`
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        active,
        image: imagePath,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || "Erro no upload" },
      { status: 500 }
    )
  }
}

/* =========================
   PUT - atualizar categoria
========================= */
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const data = await req.formData()

    const file = data.get("file") as File | null
    const name = data.get("name") as string
    const active = data.get("active") === "true"
    let slug = (data.get("slug") as string) || slugify(name, { lower: true, strict: true })

    let imagePath: string | null = null

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = Date.now() + "-" + file.name.replace(/\s/g, "_")
      const filePath = path.join(process.cwd(), "public/uploads", fileName)
      await writeFile(filePath, buffer)
      imagePath = `/uploads/${fileName}`
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, active, ...(imagePath ? { image: imagePath } : {}) },
    })

    return NextResponse.json(category)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || "Erro ao atualizar categoria" },
      { status: 500 }
    )
  }
}

/* =========================
   DELETE - excluir categoria
========================= */
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    // 🔹 Se houver produtos relacionados, opcional: deletar produtos ou impedir exclusão
    const relatedProducts = await prisma.product.count({ where: { categoryId: id } })
    if (relatedProducts > 0) {
      return NextResponse.json({ error: "Categoria possui produtos relacionados" }, { status: 400 })
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || "Erro ao deletar categoria" },
      { status: 500 }
    )
  }
}
