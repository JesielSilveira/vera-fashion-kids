export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    // 🔹 Cria slug automaticamente se não vier do frontend
    const slug = body.slug?.trim() || slugify(body.name, { lower: true, strict: true });

    // 🔹 Cria o produto no banco
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        price: Number(body.price ?? 0),
        description: body.description ?? "",
        images: Array.isArray(body.images) ? body.images : [],
        sizes: Array.isArray(body.sizes) ? body.sizes : [],
        colors: Array.isArray(body.colors) ? body.colors : [],
        stock: Number(body.stock ?? 0),
        active: body.active ?? true,
        featured: body.featured ?? false,
        bestSeller: body.bestSeller ?? false,
        weight: body.weight != null ? Number(body.weight) : null,
        height: body.height != null ? Number(body.height) : null,
        width: body.width != null ? Number(body.width) : null,
        length: body.length != null ? Number(body.length) : null,
        categoryId: body.categoryId ?? null,
        variations: Array.isArray(body.variations)
          ? {
              create: body.variations.map((v: any) => ({
                size: v.size ?? null,
                color: v.color ?? null,
                stock: Number(v.stock ?? 0),
                priceDiff: Number(v.priceDiff ?? 0),
              })),
            }
          : undefined,
      },
      include: {
        variations: true,
        reviews: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error("Erro ao criar produto:", err);
    return NextResponse.json(
      { error: err.message || "Erro no servidor" },
      { status: 500 }
    );
  }
}
