export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/categories/[id]
export async function GET(
  req: NextRequest,
  context: { params: { id: string } } // ⚠️ objeto direto, sem Promise
) {
  const { id } = context.params;
  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

  return NextResponse.json(category);
}

// PUT /api/admin/categories/[id]
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } } // ⚠️ objeto direto
) {
  const { id } = context.params;
  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  const body = await req.json();

  const category = await prisma.category.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(category);
}

// DELETE /api/admin/categories/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } } // ⚠️ objeto direto
) {
  const { id } = context.params;
  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  const relatedProducts = await prisma.product.count({ where: { categoryId: id } });
  if (relatedProducts > 0) {
    return NextResponse.json(
      { error: "Categoria possui produtos relacionados" },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
