import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// --- LISTAR BANNERS (GET) ---
export async function GET(req: NextRequest) {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
      include: { category: true },
    })

    // O map garante que se algum campo estiver nulo no banco, o código não quebre
    const formatted = banners.map(b => ({
      id: b.id,
      title: b.title || "Sem título",
      image: b.image || "",
      link: b.link || null,
      order: b.order || 0,
      active: b.active ?? true,
      categoryId: b.categoryId,
      categoryName: b.category?.name || "Sem categoria",
    }))

    return NextResponse.json(formatted)
  } catch (err: any) {
    console.error("Erro no GET Banners:", err)
    return NextResponse.json({ error: "Erro ao buscar banners" }, { status: 500 })
  }
}

// --- CRIAR BANNER (POST) ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, image, categoryId, order, active } = body

    if (!title || !image || !categoryId) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      )
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        image, // Aqui agora estamos esperando o LINK da imagem
        categoryId,
        order: Number(order) || 0,
        active: active ?? true,
      },
    })

    return NextResponse.json(banner, { status: 201 })
  } catch (err: any) {
    console.error("Erro no POST Banners:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}