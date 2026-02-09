import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/categories/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } } // <- sem Promise!
) {
  const { id } = params

  const category = await prisma.category.findUnique({ where: { id } })

  if (!category) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
  }

  return NextResponse.json(category)
}

// PUT /api/admin/categories/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } } // <- sem Promise!
) {
  const { id } = params
  const data = await req.json()

  const category = await prisma.category.update({
    where: { id },
    data,
  })

  return NextResponse.json(category)
}

// DELETE /api/admin/categories/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } } // <- sem Promise!
) {
  const { id } = params

  await prisma.category.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
