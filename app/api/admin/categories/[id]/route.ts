export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

// GET /api/admin/categories/[id]
export async function GET(req: Request, context: Context) {
  const { id } = await context.params;

  // Se for "new", retorna um objeto limpo para o formulário não quebrar
  if (id === "new") {
    return NextResponse.json({ name: "", slug: "", active: true });
  }

  const category = await prisma.category.findUnique({ where: { id } });
  
  if (!category) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }

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

  try {
    // 1. Desvincular Produtos (setar categoryId como null)
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null }
    });

    // 2. Deletar Banners vinculados (O seu Schema exige categoryId, então banners sem categoria não podem existir)
    await prisma.banner.deleteMany({
      where: { categoryId: id }
    });

    // 3. Agora sim, deletar a Categoria
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao excluir. Verifique dependências." }, { status: 500 });
  }
}
