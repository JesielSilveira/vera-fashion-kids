export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!data.name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name, { lower: true, strict: true }),
        active: data.active ?? true,
        image: data.image || ""
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Erro no POST Category:", error);
    return NextResponse.json({ error: "Erro ao criar categoria (verifique se o slug já existe)" }, { status: 500 });
  }
}