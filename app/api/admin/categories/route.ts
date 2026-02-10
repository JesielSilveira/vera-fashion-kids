export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

// GET /api/admin/categories
export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

// POST /api/admin/categories
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const name = data.name?.toString().trim();
    const slug = data.slug?.toString().trim() || slugify(name ?? "", { lower: true, strict: true });
    const active = Boolean(data.active);

    if (!name) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

    const category = await prisma.category.create({ data: { name, slug, active } });
    return NextResponse.json(category, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Erro ao criar categoria" }, { status: 500 });
  }
}
