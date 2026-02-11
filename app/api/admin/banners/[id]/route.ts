export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

// GET - Busca banner individual ou template para novo
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    if (id === "new" || id === "novo") {
      return NextResponse.json({ 
        title: "", 
        image: "", 
        active: true, 
        order: 0, 
        link: "", 
        categoryId: null 
      });
    }

    const banner = await prisma.banner.findUnique({ 
      where: { id },
      include: { category: true } // Opcional: traz dados da categoria junto
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner não encontrado" }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT - Atualiza banner
export async function PUT(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    // Validação básica: se o seu schema exige categoryId, 
    // precisamos garantir que ele não seja uma string vazia.
    const updateData: any = {
      title: data.title,
      image: data.image,
      link: data.link || null,
      active: !!data.active,
      order: Number(data.order) || 0,
    };

    // Se o seu banco exige CategoryId (Relation), conectamos aqui
    if (data.categoryId) {
      updateData.categoryId = data.categoryId;
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(banner);
  } catch (error: any) {
    console.error("Erro no PUT Banner:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar: verifique se a categoria selecionada é válida." }, 
      { status: 500 }
    );
  }
}

// DELETE - Remove o banner
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    await prisma.banner.delete({
      where: { id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro no DELETE Banner:", error);
    return NextResponse.json({ error: "Erro ao excluir banner" }, { status: 500 });
  }
}