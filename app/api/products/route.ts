export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Gerar slug seguro
    const slug = body.slug?.trim() || 
                 slugify(body.name ?? "produto", { lower: true, strict: true });

    // 2. Criar o produto batendo com o Schema
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: slug,
        price: Number(body.price),
        description: body.description,
        
        // No seu Schema são campos Json
        images: body.images || [],
        sizes: body.sizes || [],
        colors: body.colors || [],

        // Campos de frete (opcionais no Schema Float?)
        weight: body.weight ? Number(body.weight) : null,
        height: body.height ? Number(body.height) : null,
        width: body.width ? Number(body.width) : null,
        length: body.length ? Number(body.length) : null,

        stock: Number(body.stock ?? 0),
        active: body.active ?? true,
        featured: body.featured ?? false,
        bestSeller: body.bestSeller ?? false,

        // Relacionamento com Categoria (String? no seu Schema)
        categoryId: body.categoryId || null,

        // Variações (Relacionamento Variation[])
        variations: body.variations ? {
          create: body.variations.map((v: any) => ({
            size: v.size,
            color: v.color,
            stock: Number(v.stock),
            priceDiff: Number(v.priceDiff ?? 0)
          }))
        } : undefined
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error("ERRO PRISMA:", err);
    return NextResponse.json(
      { error: "Erro ao salvar produto. Verifique se o slug é único." }, 
      { status: 500 }
    );
  }
}