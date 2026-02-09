export const dynamic = 'force-dynamic';

import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> } // ⚠️ Promise aqui
) {
  const { slug } = await context.params // precisa do await

  if (!slug) {
    return NextResponse.json(
      { error: "Categoria não encontrada" },
      { status: 404 }
    )
  }

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { active: true },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!category || !category.active) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Erro ao buscar categoria" },
      { status: 500 }
    )
  }
}
