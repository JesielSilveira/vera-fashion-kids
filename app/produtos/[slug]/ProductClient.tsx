"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { AddToCartButton } from "@/app/_components/cart/add-to-cart-button"
import { Button } from "@/components/ui/button"

type Variation = {
  id: string
  size?: string | null
  color?: string | null
  stock: number
  priceDiff: number
}

type Review = {
  id: string
  name: string
  rating: number
  comment: string
}

type ProductImage = {
  url: string
}

type ProductClientProduct = {
  id: string
  slug: string
  name: string
  price: number
  description?: string
  images: (string | ProductImage)[]
  variations: Variation[]
  weight?: number | null
  height?: number | null
  width?: number | null
  length?: number | null
  reviews?: Review[]
  categoryId?: string | null
}

export default function ProductClient({
  product,
  relatedProducts,
}: {
  product: ProductClientProduct
  relatedProducts: ProductClientProduct[]
}) {
  // converte imagens para o formato {url: string} uniformemente
  const images: ProductImage[] = product.images.map(img =>
    typeof img === "string" ? { url: img } : img
  )

  const sizes = useMemo(
    () =>
      Array.from(
        new Set(product.variations.map(v => v.size).filter(Boolean))
      ) as string[],
    [product.variations]
  )

  const colors = useMemo(
    () =>
      Array.from(
        new Set(product.variations.map(v => v.color).filter(Boolean))
      ) as string[],
    [product.variations]
  )

  const [mainImage, setMainImage] = useState<string>(images[0]?.url ?? "")
  const [selectedSize, setSelectedSize] = useState<string | undefined>()
  const [selectedColor, setSelectedColor] = useState<string | undefined>()

  const selectedVariation = product.variations.find(
    v =>
      (!selectedSize || v.size === selectedSize) &&
      (!selectedColor || v.color === selectedColor)
  )

  const finalPrice = product.price + (selectedVariation?.priceDiff ?? 0)

  const canAddToCart =
    product.variations.length === 0 ||
    (selectedVariation && selectedVariation.stock > 0)

  const productForCart = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: finalPrice,
    images,
    sizes,
    colors,
  }

  function ReviewForm({ productId }: { productId: string }) {
    const [name, setName] = useState("")
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      setLoading(true)
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, name, rating, comment }),
        })

        if (!res.ok) throw new Error("Erro ao enviar avaliação")

        setSuccess(true)
        setName("")
        setRating(5)
        setComment("")
        location.reload()
      } catch (err) {
        console.error(err)
        alert("Erro ao enviar avaliação")
      } finally {
        setLoading(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="border rounded-xl p-4 space-y-4">
        <h3 className="font-bold text-lg">Avaliar este produto</h3>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Seu nome"
          required
          className="w-full border rounded px-3 py-2"
        />
        <select
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        >
          {[5, 4, 3, 2, 1].map(r => (
            <option key={r} value={r}>
              {r} ⭐
            </option>
          ))}
        </select>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Comentário"
          required
          className="w-full border rounded px-3 py-2"
        />
        <Button disabled={loading}>{loading ? "Enviando..." : "Enviar avaliação"}</Button>
        {success && <p className="text-green-600 text-sm">Avaliação enviada com sucesso!</p>}
      </form>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* GALERIA */}
        <div className="space-y-6">
          <div className="relative h-[520px] w-full overflow-hidden rounded-3xl border bg-gray-50">
            {mainImage ? (
              <Image src={mainImage} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">Sem imagem</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map(img => (
                <button
                  key={img.url}
                  onClick={() => setMainImage(img.url)}
                  className={`relative h-28 rounded-xl overflow-hidden border ${
                    mainImage === img.url ? "border-black" : "border-gray-200"
                  }`}
                >
                  <Image src={img.url} alt={product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold">{product.name}</h1>
          <p className="text-3xl font-bold text-black-600">R$ {finalPrice.toFixed(2)}</p>

          <AddToCartButton product={productForCart} />

          {(product.weight || product.height || product.width || product.length) && (
            <div className="p-4 border rounded-xl bg-gray-50">
              <h2 className="font-semibold mb-2">Dimensões</h2>
              <ul className="text-sm space-y-1">
                {product.weight && <li>Peso: {product.weight} kg</li>}
                {product.height && <li>Altura: {product.height} cm</li>}
                {product.width && <li>Largura: {product.width} cm</li>}
                {product.length && <li>Comprimento: {product.length} cm</li>}
              </ul>
            </div>
          )}

          {product.description && (
            <div>
              <h2 className="font-semibold mb-1">Descrição</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {product.reviews && product.reviews.length > 0 && (
            <div className="space-y-4 mt-6">
              <h2 className="text-xl font-bold">Avaliações</h2>
              {product.reviews.map(r => (
                <div key={r.id} className="border rounded-xl p-4">
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-yellow-500 text-sm">⭐ {r.rating}/5</p>
                  <p className="text-gray-600 mt-1">{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          <ReviewForm productId={product.id} />
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Você também pode gostar</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {relatedProducts.map(p => {
              const img = p.images[0]
              const url = typeof img === "string" ? img : img?.url ?? ""
              return (
                <div key={p.id} className="border rounded-xl p-3">
                  {url ? (
                    <Image src={url} alt={p.name} width={200} height={200} className="object-cover rounded" />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400 rounded">Sem imagem</div>
                  )}
                  <h3 className="font-semibold mt-2">{p.name}</h3>
                  <p className="text-green-600 font-bold">R$ {p.price.toFixed(2)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

