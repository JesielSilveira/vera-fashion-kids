import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

type Ctx = { params: Promise<{ id: string }> }

// GET
export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const category = await prisma.category.findUnique({ where: { id } })

  if (!category)
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })

  return NextResponse.json(category)
}

// PUT
export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const data = await req.json()

  const category = await prisma.category.update({ where: { id }, data })
  return NextResponse.json(category)
}

// DELETE
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  await prisma.category.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
