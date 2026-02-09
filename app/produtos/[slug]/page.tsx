import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProductClient from "./ProductClient"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  if (!slug) notFound()

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variations: true,
      reviews: {
        orderBy: { createdAt: "desc" },
      },
      category: true,
    },
  })

  if (!product || !product.active) notFound()

  const relatedProducts = product.categoryId
    ? await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          active: true,
        },
        take: 4,
      })
    : []

  const productForClient = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    description: product.description ?? "",

    images: Array.isArray(product.images) ? product.images : [],

    variations: product.variations.map(v => ({
      id: v.id,
      size: v.size,
      color: v.color,
      stock: v.stock,
      priceDiff: v.priceDiff,
    })),

    weight: product.weight,
    height: product.height,
    width: product.width,
    length: product.length,

    categoryId: product.categoryId, // ✅ ESSENCIAL

    reviews: product.reviews.map(r => ({
      id: r.id,
      name: r.name,
      rating: r.rating,
      comment: r.comment,
    })),
  }

  

  return (
    <ProductClient
      product={productForClient}
      relatedProducts={relatedProducts}
    />
  )
}
