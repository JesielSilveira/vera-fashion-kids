export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import slugify from "slugify"

// 🔹 LISTAR CATEGORIAS
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Erro GET Category:", error)
    return NextResponse.json(
      { error: "Erro ao buscar categorias" },
      { status: 500 }
    )
  }
}

// 🔹 CRIAR CATEGORIA
export async function POST(req: Request) {
  try {
    const data = await req.json()

    const name = data.name?.trim()
    const image = data.image?.trim()

    if (!name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    if (!image || !image.startsWith("http")) {
      return NextResponse.json(
        { error: "Imagem inválida (URL do Cloudinary obrigatória)" },
        { status: 400 }
      )
    }

    const slug =
      data.slug?.trim() ||
      slugify(name, { lower: true, strict: true })

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        active: data.active ?? true,
        image, // ✅ URL do Cloudinary
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error("Erro POST Category:", error)

    // erro comum de slug duplicado
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma categoria com esse slug" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    )
  }
}
