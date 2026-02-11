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

    // 2️⃣ Gerar Slug e verificar duplicatas
    let slug = body.slug?.trim() || slugify(body.name, { lower: true, strict: true });
    
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    // Se o slug já existir, adiciona um sufixo aleatório para não quebrar o banco
    if (existingProduct) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // 3️⃣ Criação do Produto
const product = await prisma.product.create({
  data: {
    name: body.name,
    slug: slug,
    price: Number(body.price),
    description: body.description || "",
    
    // ✅ Para campos JSON no MySQL, garantimos que enviamos um array
    // Se body.images for null, enviamos um array vazio []
    images: body.images || [], 
    sizes: body.sizes || [],
    colors: body.colors || [],

    // ✅ Campos numéricos com fallback para evitar NaN
    stock: Number(body.stock ?? 0),
    weight: body.weight ? Number(body.weight) : null,
    height: body.height ? Number(body.height) : null,
    width: body.width ? Number(body.width) : null,
    length: body.length ? Number(body.length) : null,
    
    active: Boolean(body.active ?? true),
    featured: Boolean(body.featured ?? false),
    bestSeller: Boolean(body.bestSeller ?? false),

    // ✅ Relacionamento com Categoria
    // Usamos connect para ligar a um ID existente
    category: body.categoryId 
      ? { connect: { id: body.categoryId } } 
      : undefined,

    // ✅ Variações (Nested Create)
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
    console.error("Erro ao criar produto:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao salvar produto" },
      { status: 500 }
    );
  }
}