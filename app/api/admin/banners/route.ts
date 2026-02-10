export const dynamic = 'force-dynamic';

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
    console.log("👉 Tentando criar banner com:", data) // 👈 Olhe isso no log da Vercel!

    const { title, image, categoryId, order, active } = data

    // Validação básica
    if (!title || !image || !categoryId) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando (Título, Imagem ou Categoria)" },
        { status: 400 }
      )
    }

    const banner = await prisma.banner.create({
      data: { 
        title, 
        image, // Certifique-se que aqui é uma URL, não o arquivo bruto
        categoryId, 
        order: Number(order || 0), // Garante que seja número
        active: active ?? true 
      },
    })

    return NextResponse.json(banner, { status: 201 })
  } catch (err: any) {
    console.error("🔥 Erro detalhado no POST Banner:", err)
    
    // Se o erro for do Prisma sobre relação, avisamos melhor
    if (err.code === 'P2003') {
      return NextResponse.json({ error: "Categoria selecionada não existe no banco." }, { status: 400 })
    }

    return NextResponse.json({ error: "Erro ao salvar no banco. Verifique os dados." }, { status: 500 })
  }
}