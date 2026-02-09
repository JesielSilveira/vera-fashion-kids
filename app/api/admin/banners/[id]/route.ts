export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/* 🔹 GET */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const banner = await prisma.banner.findUnique({
      where: { id },
    })

    if (!banner) {
      return NextResponse.json(
        { error: "Banner não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(banner)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Erro ao carregar banner" },
      { status: 500 }
    )
  }
}

/* 🔹 PUT */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await req.json()

    if (!body.title || !body.image) {
      return NextResponse.json(
        { error: "Título e imagem são obrigatórios" },
        { status: 400 }
      )
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title: body.title,
        image: body.image,
        link: body.link || null,
        order: typeof body.order === "number" ? body.order : 0,
        active: Boolean(body.active),
      },
    })

    return NextResponse.json(banner)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Erro ao atualizar banner" },
      { status: 500 }
    )
  }
}

/* 🔹 DELETE */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await prisma.banner.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Erro ao deletar banner" },
      { status: 500 }
    )
  }
}
