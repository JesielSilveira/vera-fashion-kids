"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { AddToCartButton } from "@/app/_components/cart/add-to-cart-button"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Star } from "lucide-react"

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
  const images: ProductImage[] = product.images.map(img =>
    typeof img === "string" ? { url: img } : img
  )

  const sizes = useMemo(() => 
    Array.from(new Set(product.variations.map(v => v.size).filter(Boolean))) as string[],
    [product.variations]
  )

  const colors = useMemo(() => 
    Array.from(new Set(product.variations.map(v => v.color).filter(Boolean))) as string[],
    [product.variations]
  )

  const [mainImage, setMainImage] = useState<string>(images[0]?.url ?? "")
  const [selectedSize, setSelectedSize] = useState<string | undefined>()
  const [selectedColor, setSelectedColor] = useState<string | undefined>()
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const selectedVariation = product.variations.find(
    v => (!selectedSize || v.size === selectedSize) && (!selectedColor || v.color === selectedColor)
  )

  const finalPrice = product.price + (selectedVariation?.priceDiff ?? 0)

  const productForCart = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: finalPrice,
    images,
    size: selectedSize,
    color: selectedColor,
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 space-y-12">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* GALERIA - IMAGEM INTEIRA */}
        <div className="space-y-4">
          <div className="relative h-[400px] md:h-[520px] w-full overflow-hidden rounded-2xl border bg-white flex items-center justify-center">
            {mainImage ? (
              <Image 
                src={mainImage} 
                alt={product.name} 
                fill 
                className="object-contain p-2 md:p-4" 
                priority 
              />
            ) : (
              <div className="text-gray-400">Sem imagem</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img.url)}
                  className={`relative h-20 md:h-28 rounded-xl overflow-hidden border bg-white ${
                    mainImage === img.url ? "border-black ring-1 ring-black" : "border-gray-200"
                  }`}
                >
                  <Image src={img.url} alt={product.name} fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO DO PRODUTO */}
        <div className="flex flex-col space-y-6">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-4">
            <p className="text-3xl font-bold text-gray-900">R$ {finalPrice.toFixed(2)}</p>
            {product.reviews && product.reviews.length > 0 && (
              <span className="flex items-center text-sm font-medium bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                <Star className="w-4 h-4 fill-current mr-1" /> 
                {(product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)}
              </span>
            )}
          </div>

          {/* VARIAÇÕES (TAMANHO/COR) - OPCIONAL: ADICIONE SEU SELETOR AQUI */}

          <div className="pt-2">
            <AddToCartButton product={productForCart} />
          </div>

          {/* DESCRIÇÃO CORRIGIDA - SEM CORTES NO SLUG */}
          {product.description && (
            <div className="border-t pt-6 space-y-3">
              <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">Descrição Detalhada</h2>
              <div className="relative">
                <div 
                  className={`text-gray-700 text-base leading-relaxed prose prose-sm max-w-none transition-all duration-500 overflow-hidden ${
                    !isDescriptionExpanded ? "max-h-[150px]" : "max-h-[5000px]"
                  }`}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
                
                {product.description.length > 300 && (
                  <button 
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="flex items-center gap-1 text-black font-extrabold mt-4 hover:underline border-b-2 border-black pb-0.5"
                  >
                    {isDescriptionExpanded ? (
                      <>MOSTRAR MENOS <ChevronUp size={18} /></>
                    ) : (
                      <>LER DESCRIÇÃO COMPLETA <ChevronDown size={18} /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DIMENSÕES */}
          {(product.weight || product.height || product.width || product.length) && (
            <div className="p-4 border rounded-xl bg-gray-50 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Peso</span>
                <span className="font-semibold">{product.weight || "-"} kg</span>
              </div>
              <div>
                <span className="text-gray-500 block">Dimensões (AxLxC)</span>
                <span className="font-semibold">
                  {product.height || "0"}x{product.width || "0"}x{product.length || "0"} cm
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRODUTOS RELACIONADOS */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t">
          <h2 className="text-2xl font-black mb-8">QUEM VIU, TAMBÉM AMOU</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(p => {
              const img = p.images[0]
              const url = typeof img === "string" ? img : img?.url ?? ""
              return (
                <a href={`/product/${p.slug}`} key={p.id} className="group space-y-3">
                  <div className="relative h-48 md:h-64 w-full bg-white border rounded-2xl overflow-hidden">
                    <Image src={url} alt={p.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="font-bold text-gray-800 truncate">{p.name}</h3>
                  <p className="font-black text-lg">R$ {p.price.toFixed(2)}</p>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}