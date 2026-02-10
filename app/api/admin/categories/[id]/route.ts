export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

// =========================
// GET /api/admin/categories/[id]
// =========================
export async function GET(req: Request, context: Context) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

  return NextResponse.json(category);
}

// =========================
// PUT /api/admin/categories/[id]
// =========================
export async function PUT(req: Request, context: Context) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  try {
    const data = await req.json();

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return NextResponse.json(category);
  } catch (err: any) {
    console.error("Erro ao atualizar categoria:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao atualizar categoria" },
      { status: 500 }
    );
  }
}

// =========================
// DELETE /api/admin/categories/[id]
// =========================
export async function DELETE(req: Request, context: Context) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  try {
    const relatedProducts = await prisma.product.count({ where: { categoryId: id } });
    if (relatedProducts > 0) {
      return NextResponse.json(
        { error: "Categoria possui produtos relacionados" },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Erro ao deletar categoria:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao deletar categoria" },
      { status: 500 }
    );
  }
}
