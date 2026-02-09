import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Ctx = { params: Promise<{ id: string }> }

/* 🔹 GET */
export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params

  const category = await prisma.category.findUnique({
    where: { id },
  })

  if (!category) {
    return NextResponse.json(
      { error: "Categoria não encontrada" },
      { status: 404 }
    )
  }

  return NextResponse.json(category)
}

/* 🔹 PUT */
export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const data = await req.json()

  const cat = await prisma.category.update({
    where: { id },
    data,
  })

  return NextResponse.json(cat)
}

/* 🔹 DELETE */
export async function DELETE(req: Request, ctx: Ctx) {
  const { id } = await ctx.params

  await prisma.category.delete({
    where: { id },
  })

  return NextResponse.json({ ok: true })
}
