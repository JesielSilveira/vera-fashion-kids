export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: Context) {
  const { id } = await context.params;
  if (id === "new") return NextResponse.json({ title: "", image: "", active: true });

  const banner = await prisma.banner.findUnique({ where: { id } });
  return NextResponse.json(banner || { error: "Não encontrado" }, { status: banner ? 200 : 404 });
}

export async function PUT(req: Request, context: Context) {
  const { id } = await context.params;
  const data = await req.json();

  // Garante que o categoryId exista, senão o Prisma trava
  const banner = await prisma.banner.update({
    where: { id },
    data: {
      title: data.title,
      image: data.image,
      link: data.link,
      active: data.active,
      categoryId: data.categoryId // ⚠️ Lembre-se: O Schema exige isso!
    }
  });
  return NextResponse.json(banner);
}

export async function DELETE(req: Request, context: Context) {
  const { id } = await context.params;
  await prisma.banner.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}