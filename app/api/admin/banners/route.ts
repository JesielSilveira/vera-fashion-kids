import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// --- LISTAR BANNERS (GET) ---
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        image: true,
        link: true,
        order: true,
        active: true,
        categoryId: true,
        category: {
          select: { name: true },
        },
      },
    })

    const formatted = banners
      .filter(b => !!b.image) // evita banner sem imagem
      .map(b => ({
        id: b.id,
        title: b.title || "Sem título",
        image: b.image,
        link: b.link && b.link.trim().length > 0 ? b.link : null,
        order: b.order ?? 0,
        active: b.active ?? true,
        categoryId: b.categoryId,
        categoryName: b.category?.name || "Sem categoria",
      }))

    return NextResponse.json(formatted)
  } catch (err) {
    console.error("Erro no GET /api/banners:", err)
    return NextResponse.json(
      { error: "Erro ao buscar banners" },
      { status: 500 }
    )
  }
}

// --- CRIAR BANNER (POST) ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, image, categoryId, order, active, link } = body

    if (!title || !image || !categoryId) {
      return NextResponse.json(
        { error: "Título, imagem e categoria são obrigatórios" },
        { status: 400 }
      )
    }

    const banner = await prisma.banner.create({
      data: {
        title: title.trim(),
        image: image.trim(), // URL do Cloudinary
        link: link?.trim() || null,
        categoryId,
        order: Number(order) || 0,
        active: active ?? true,
      },
    })

    return NextResponse.json(banner, { status: 201 })
  } catch (err: any) {
    console.error("Erro no POST /api/banners:", err)
    return NextResponse.json(
      { error: err.message || "Erro ao criar banner" },
      { status: 500 }
    )
  }
}
