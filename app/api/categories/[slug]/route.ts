import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Props = {
  params: {
    slug: string
  }
}

export async function GET(
  req: Request,
  { params }: Props
) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
      include: {
        products: {
          where: {
            active: true,
          },
          orderBy: {
            createdAt: "desc",
          },
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
