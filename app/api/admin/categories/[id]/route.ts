export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

// GET /api/admin/categories/[id]
export async function GET(req: Request, context: Context) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

  return NextResponse.json(category);
}

// PUT /api/admin/categories/[id]
export async function PUT(req: Request, context: Context) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  const data = await req.json();
  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json(category);
}

// DELETE /api/admin/categories/[id]
export async function DELETE(req: Request, context: Context) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
