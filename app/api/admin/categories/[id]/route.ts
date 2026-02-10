export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ [key: string]: string }>;
};

// GET /api/admin/categories/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

  return NextResponse.json(category);
}

// PUT /api/admin/categories/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  const body = await req.json();

  const category = await prisma.category.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(category);
}

// DELETE /api/admin/categories/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
