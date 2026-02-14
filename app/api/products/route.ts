export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1️⃣ Validação básica
    if (!body.name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    if (!body.categoryId) {
      return NextResponse.json({ error: "Categoria é obrigatória" }, { status: 400 });
    }

    // 2️⃣ Gerar Slug e verificar duplicatas (CORRIGIDO)
    let slug = body.slug?.trim() || slugify(body.name, { lower: true, strict: true });
    
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    // Se o slug já existir, adiciona um sufixo numérico (Date.now convertido para string)
    if (existingProduct) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // 3️⃣ Criação do Produto no Prisma
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: slug,
        price: Number(body.price) || 0,
        description: body.description || "",
        
        // Campos JSON: Garantimos que sejam arrays
        images: Array.isArray(body.images) ? body.images : [], 
        sizes: Array.isArray(body.sizes) ? body.sizes : [],
        colors: Array.isArray(body.colors) ? body.colors : [],

        // Campos numéricos com fallback para evitar NaN ou nulos
        stock: Number(body.stock ?? 0),
        weight: body.weight ? Number(body.weight) : null,
        height: body.height ? Number(body.height) : null,
        width: body.width ? Number(body.width) : null,
        length: body.length ? Number(body.length) : null,
        
        active: Boolean(body.active ?? true),
        featured: Boolean(body.featured ?? false),
        bestSeller: Boolean(body.bestSeller ?? false),

        // Relacionamento com Categoria (usando o campo direto ou connect)
        // Se no seu schema for apenas a String: categoryId: body.categoryId
        // Se for objeto de relação:
        category: {
          connect: { id: body.categoryId }
        },

        // Variações (Criação encadeada)
        variations: body.variations && body.variations.length > 0 
          ? {
              create: body.variations.map((v: any) => ({
                size: v.size || null,
                color: v.color || null,
                stock: Number(v.stock ?? 0),
                priceDiff: Number(v.priceDiff ?? 0),
              }))
            }
          : undefined,
      },
      include: {
        variations: true,
      }
    });

    return NextResponse.json(product, { status: 201 });

  } catch (err: any) {
    console.error("ERRO AO CRIAR PRODUTO:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao salvar produto" },
      { status: 500 }
    );
  }
}