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

  const relatedProductsRaw = product.categoryId
    ? await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          active: true,
        },
        take: 4,
        include: { variations: true, reviews: true, category: true, },
      })
    : []

  const mapToClientProduct = (p: typeof product) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    description: p.description ?? "",
    images: Array.isArray(p.images)
      ? p.images.filter((img): img is string => typeof img === "string")
      : [],
    variations: p.variations.map(v => ({
      id: v.id,
      size: v.size,
      color: v.color,
      stock: v.stock,
      priceDiff: v.priceDiff,
    })),
    weight: p.weight,
    height: p.height,
    width: p.width,
    length: p.length,
    categoryId: p.categoryId,
    reviews: p.reviews.map(r => ({
      id: r.id,
      name: r.name,
      rating: r.rating,
      comment: r.comment,
    })),
  })

  const productForClient = mapToClientProduct(product)
  const relatedProducts = relatedProductsRaw.map(mapToClientProduct)

  return (
    <ProductClient
      product={productForClient}
      relatedProducts={relatedProducts}
    />
  )
}
