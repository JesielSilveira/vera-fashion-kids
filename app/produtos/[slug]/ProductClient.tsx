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
      <form onSubmit={handleSubmit} className="border rounded-xl p-4 space-y-4 mt-6 bg-white">
        <h3 className="font-bold text-lg text-gray-900">Avaliar este produto</h3>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" required className="w-full border rounded px-3 py-2" />
        <select value={rating} onChange={e => setRating(Number(e.target.value))} className="w-full border rounded px-3 py-2">
          {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} ⭐</option>)}
        </select>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="O que achou do produto?" required className="w-full border rounded px-3 py-2 h-24" />
        <Button disabled={loading} className="w-full">{loading ? "Enviando..." : "Enviar avaliação"}</Button>
        {success && <p className="text-green-600 text-sm">Avaliação enviada com sucesso!</p>}
      </form>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 space-y-12">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* GALERIA - FOCO EM IMAGEM INTEIRA */}
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
              <div className="text-gray-400 font-medium">Sem imagem disponível</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img.url)}
                  className={`relative h-20 md:h-28 rounded-xl overflow-hidden border bg-white transition-all ${
                    mainImage === img.url ? "border-black ring-1 ring-black scale-95" : "border-gray-200 hover:border-gray-400"
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
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight uppercase">{product.name}</h1>
            <p className="text-3xl font-bold text-gray-900">R$ {finalPrice.toFixed(2)}</p>
          </div>

          <AddToCartButton product={productForCart} />

          {/* DESCRIÇÃO - SUPORTE A HTML DO ADMIN */}
          {product.description && (
            <div className="border-t pt-6 space-y-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Detalhes do Produto</h2>
              <div className="relative">
                <div 
                  className={`text-gray-700 text-base leading-relaxed overflow-hidden transition-all duration-500 ${
                    !isDescriptionExpanded ? "max-h-[120px]" : "max-h-[5000px]"
                  }`}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
                
                {product.description.length > 200 && (
                  <button 
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="flex items-center gap-1 text-black font-black mt-4 hover:underline border-b-2 border-black pb-0.5 text-xs uppercase tracking-tighter"
                  >
                    {isDescriptionExpanded ? (
                      <>Mostrar Menos <ChevronUp size={16} /></>
                    ) : (
                      <>Ler Descrição Completa <ChevronDown size={16} /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DIMENSÕES */}
          {(product.weight || product.height || product.width || product.length) && (
            <div className="p-4 border rounded-xl bg-gray-50 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block uppercase font-bold">Peso</span>
                <span className="font-semibold text-gray-900">{product.weight || "-"} kg</span>
              </div>
              <div>
                <span className="text-gray-400 block uppercase font-bold">Medidas (AxLxC)</span>
                <span className="font-semibold text-gray-900">
                  {product.height || "0"}x{product.width || "0"}x{product.length || "0"} cm
                </span>
              </div>
            </div>
          )}

          {/* SEÇÃO DE AVALIAÇÕES - RESTAURADA */}
          <div className="border-t pt-8 space-y-6">
             <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">O que os clientes dizem</h2>
             
             {product.reviews && product.reviews.length > 0 ? (
               <div className="space-y-4">
                 {product.reviews.map(r => (
                   <div key={r.id} className="border rounded-xl p-4 bg-white shadow-sm">
                     <div className="flex justify-between items-center mb-2">
                       <p className="font-bold text-gray-900">{r.name}</p>
                       <div className="flex text-yellow-500">
                         {Array.from({ length: r.rating }).map((_, i) => (
                           <Star key={i} size={14} className="fill-current" />
                         ))}
                       </div>
                     </div>
                     <p className="text-gray-600 text-sm italic">"{r.comment}"</p>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-gray-400 text-sm italic">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
             )}

             <ReviewForm productId={product.id} />
          </div>
        </div>
      </div>

      {/* PRODUTOS RELACIONADOS */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t">
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(p => {
              const img = p.images[0]
              const url = typeof img === "string" ? img : img?.url ?? ""
              return (
                <a href={`/produtos/${p.slug}`} key={p.id} className="group space-y-3 bg-white p-3 rounded-2xl border hover:shadow-md transition-shadow">
                  <div className="relative h-40 md:h-56 w-full overflow-hidden rounded-xl">
                    <Image src={url} alt={p.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm truncate uppercase">{p.name}</h3>
                  <p className="font-black text-gray-900">R$ {p.price.toFixed(2)}</p>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}