export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

// GET - Busca uma categoria ou retorna template para "nova"
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    if (id === "nova" || id === "novo" || id === "new") {
      return NextResponse.json({ name: "", slug: "", active: true, image: null });
    }

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erro no GET Category:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

// PUT - Atualiza categoria
export async function PUT(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    // 1. Verifica se o slug pretendido já está em uso por OUTRA categoria
    if (data.slug) {
      const conflict = await prisma.category.findFirst({
        where: {
          slug: data.slug,
          NOT: { id: id }
        }
      });
      if (conflict) {
        return NextResponse.json({ error: "Este slug já está sendo usado por outra categoria" }, { status: 400 });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        active: !!data.active,
        image: data.image ?? null // Garante que se não vier imagem, salve nulo
      }
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Erro no PUT Category:", error);
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 });
  }
}

// DELETE - Remove categoria e limpa vínculos
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    // Usamos $transaction para garantir que ou deleta tudo ou nada
    await prisma.$transaction([
      // 1. Deleta banners vinculados
      prisma.banner.deleteMany({ where: { categoryId: id } }),
      
      // 2. Desvincula produtos (seta categoryId como null)
      prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      }),

      // 3. Finalmente deleta a categoria
      prisma.category.delete({ where: { id } })
    ]);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Erro no DELETE Category:", error);
    return NextResponse.json(
      { error: "Erro ao excluir: verifique se existem dependências ativas." }, 
      { status: 500 }
    );
  }
}