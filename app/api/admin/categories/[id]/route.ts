export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    // ✅ TRATATIVA PARA O FRONT-END "NOVA"
 if (id === "nova" || id === "novo" || id === "new") {
    return NextResponse.json({ name: "", slug: "", active: true });
    }

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return NextResponse.json({ error: "Categoria não encontrada no banco" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erro no GET Category:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        active: data.active,
        image: data.image
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    // 1. Limpa relações obrigatórias do seu Schema antes de deletar
    await prisma.banner.deleteMany({ where: { categoryId: id } });
    
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null }
    });

    // 2. Deleta a categoria
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro no DELETE Category:", error);
    return NextResponse.json({ error: "Erro ao excluir categoria" }, { status: 500 });
  }
}