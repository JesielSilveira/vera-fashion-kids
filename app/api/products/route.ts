export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const slug = url.searchParams.get("slug")

    if (!slug) {
      return NextResponse.json({ error: "Slug é obrigatório" }, { status: 400 })
    }

    // 🔹 Busca produto pelo slug somente se ativo
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        variations: true,
        category: true,
      },
    })

    if (!product || !product.active) {
      return NextResponse.json({ error: "Produto não encontrado ou inativo" }, { status: 404 })
    }

    // 🔹 Busca reviews relacionadas a esse produto
    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: "desc" },
    })

    // 🔹 Produtos relacionados (mesma categoria, exceto o produto atual, apenas ativos)
    let relatedProducts: any[] = []
    if (product.categoryId) {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          active: true,
        },
        take: 6,
        orderBy: { createdAt: "desc" },
      })
    }

    // 🔹 Formata resposta
    const formatted = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      description: product.description ?? "",

      images: Array.isArray(product.images) ? product.images : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      stock: product.stock ?? 0,

      weight: product.weight ?? null,
      height: product.height ?? null,
      width: product.width ?? null,
      length: product.length ?? null,

      active: product.active,
      featured: product.featured,
      bestSeller: product.bestSeller,

      // 🔹 Variações
      variations: product.variations.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        stock: v.stock,
        priceDiff: v.priceDiff,
      })),

      // 🔹 Reviews
      reviews: reviews.map((r) => ({
        id: r.id,
        productId: r.productId,
        productSlug: product.slug,
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),

      // 🔹 Produtos relacionados
      relatedProducts: relatedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        images: Array.isArray(p.images) ? p.images : [],
      })),
    }

    return NextResponse.json(formatted)
  } catch (err) {
    console.error("Erro ao buscar produto:", err)
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 })
  }
}
