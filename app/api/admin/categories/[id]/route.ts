import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params  // ✅ precisa await

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })

  return NextResponse.json(category)
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const data = await req.json()

  const cat = await prisma.category.update({ where: { id }, data })
  return NextResponse.json(cat)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
