import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import { AddToCartButton } from "@/app/_components/cart/add-to-cart-button"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  if (!slug) notFound()

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { reviews: { orderBy: { createdAt: "desc" } } },
  })

  if (!product || !product.active) notFound()

  const images = Array.isArray(product.images) ? (product.images as string[]) : []
  const sizes = Array.isArray(product.sizes) ? (product.sizes as string[]) : []
  const colors = Array.isArray(product.colors) ? (product.colors as string[]) : []

  const productForCart = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    images: images.map((url) => ({ url })),
    sizes,
    colors,
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-12">
        
        {/* ===== GALERIA ===== */}
        <div className="space-y-6">
          <div className="relative h-[520px] w-full overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 shadow-sm">
            {images[0] ? (
              <Image
                src={images[0]}
                alt={product.name}
                fill
                className="object-cover rounded-3xl"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 font-medium">
                Sem imagem
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(1).map((img) => (
                <div key={img} className="relative h-28 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <Image src={img} alt={product.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== INFO ===== */}
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900">{product.name}</h1>
          <p className="text-3xl font-bold text-green-600">R$ {product.price.toFixed(2)}</p>

          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}

          <AddToCartButton product={productForCart} />

          {/* DIMENSÕES */}
          <div className="mt-6 p-4 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Dimensões</h2>
            <ul className="text-gray-700 space-y-1">
              <li>Peso: {product.weight ?? "N/A"} kg</li>
              <li>Altura: {product.height ?? "N/A"} cm</li>
              <li>Largura: {product.width ?? "N/A"} cm</li>
              <li>Comprimento: {product.length ?? "N/A"} cm</li>
            </ul>
          </div>

          {/* AVALIAÇÕES */}
          {product.reviews.length > 0 && (
            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Avaliações</h2>
              {product.reviews.map((r) => (
                <div key={r.id} className="border rounded-xl p-4 shadow-sm bg-white">
                  <p className="font-semibold text-gray-800">{r.name}</p>
                  <p className="text-sm text-yellow-500">⭐ {r.rating}/5</p>
                  <p className="text-gray-600 mt-1">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
