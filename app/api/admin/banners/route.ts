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

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Use JSON, é mais leve que FormData
    console.log("Recebido:", body);

    const { title, image, categoryId, order, active } = body;

    if (!image.startsWith('http')) {
       return NextResponse.json({ error: "Por favor, use um link (URL) da imagem" }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        image, // Aqui vai o link: https://site.com/foto.jpg
        categoryId,
        order: Number(order || 0),
        active: active ?? true,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (err) {
    console.error("ERRO NO BANNER:", err);
    return NextResponse.json({ error: "Erro ao salvar banner no banco" }, { status: 500 });
  }
}