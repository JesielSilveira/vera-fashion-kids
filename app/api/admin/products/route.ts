export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        price: Number(body.price),
        description: body.description ?? "",

        // 🔹 Campos obrigatórios do schema
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

        // ✅ Variações
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
        // 🔹 Inclui reviews vazias por padrão (frontend espera esse campo)
        reviews: true,
      },
    })

    // 🔹 Retorna objeto pronto para frontend do slug
    const formatted = {
      ...product,
      images: Array.isArray(product.images) ? product.images : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      stock: product.stock ?? 0,
      reviews: product.reviews ?? [],
    }

    return NextResponse.json(formatted, { status: 201 })
  } catch (err: any) {
    console.error("Erro ao criar produto:", err)
    return NextResponse.json(
      { error: err.message || "Erro no servidor" },
      { status: 500 }
    )
  }
}
