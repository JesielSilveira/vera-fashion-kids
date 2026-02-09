import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
      include: { category: true },
    })

    const formatted = banners.map(b => ({
      id: b.id,
      title: b.title,
      image: b.image,
      link: b.link ?? null,
      order: b.order,
      active: b.active,
      categoryId: b.categoryId,
      categorySlug: b.category?.slug ?? null,
    }))

    return NextResponse.json(formatted)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erro ao listar banners" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    console.log("💡 Dados recebidos no POST:", data)

    const { title, image, categoryId, order, active } = data

    if (!title || !image || !categoryId) {
      return NextResponse.json(
        { error: "Título, imagem e categoria são obrigatórios" },
        { status: 400 }
      )
    }

    const banner = await prisma.banner.create({
      data: { title, image, categoryId, order, active },
    })

    return NextResponse.json(banner, { status: 201 })
  } catch (err: any) {
    console.error("🔥 Erro no POST:", err)
    return NextResponse.json({ error: err.message || "Erro ao criar banner" }, { status: 500 })
  }
}
