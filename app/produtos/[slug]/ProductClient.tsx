"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { AddToCartButton } from "@/app/_components/cart/add-to-cart-button"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Star, Banknote, MessageCircle } from "lucide-react"

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
  // Iniciamos com a primeira variação disponível para não vir vazio
  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizes[0])
  const [selectedColor, setSelectedColor] = useState<string | undefined>(colors[0])
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const selectedVariation = product.variations.find(
    v => (!selectedSize || v.size === selectedSize) && (!selectedColor || v.color === selectedColor)
  )

  const finalPrice = product.price + (selectedVariation?.priceDiff ?? 0)
  const pixPrice = finalPrice * 0.91 // Desconto de 9% aplicado aqui

  // Objeto preparado com a variação correta para o carrinho
  const productForCart = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: finalPrice,
    image: mainImage,
  }

  const whatsappNumber = "5554991844554"
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Olá! Gostaria de assistência sobre o produto: ${product.name} (Tamanho: ${selectedSize ?? 'Não selecionado'}, Cor: ${selectedColor ?? 'Não selecionada'})`

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
    <div className="container mx-auto px-4 py-8 lg:py-12 space-y-12 overflow-x-hidden">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* GALERIA */}
        <div className="space-y-4">
          <div className="relative h-[400px] md:h-[520px] w-full overflow-hidden rounded-2xl border bg-white flex items-center justify-center">
            {mainImage ? (
              <Image src={mainImage} alt={product.name} fill className="object-contain p-2 md:p-4" priority />
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
        <div className="flex flex-col space-y-6 min-w-0">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight uppercase break-words italic tracking-tighter">
              {product.name}
            </h1>
            
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-green-600 font-black text-xs mb-1 uppercase tracking-widest">
                <Banknote size={18} />
                <span>Pix com 9% de desconto</span>
              </div>
              <p className="text-4xl font-black text-gray-900 tracking-tighter">R$ {pixPrice.toFixed(2)}</p>
              <p className="text-sm text-gray-500 font-medium">
                Ou <span className="font-bold">R$ {finalPrice.toFixed(2)}</span> no cartão
              </p>
            </div>
          </div>

          {/* SELEÇÃO DE VARIANTES */}
          <div className="space-y-6">
            {sizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Tamanho</span>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-black transition-all ${
                        selectedSize === size 
                        ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Cor</span>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-black transition-all ${
                        selectedColor === color 
                        ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-black"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BOTÕES DE AÇÃO - CORRIGIDO PARA PASSAR OS ESTADOS */}
          <div className="space-y-3 pt-4">
            {selectedVariation && selectedVariation.stock > 0 ? (
              <AddToCartButton 
                product={productForCart} 
                selectedSize={selectedSize} 
                selectedColor={selectedColor}
              />
            ) : (
              <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase text-center text-xs border-2 border-dashed border-gray-200">
                Variação sem estoque
              </div>
            )}
            
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 border-2 border-green-500 text-green-600 rounded-2xl font-black uppercase text-xs hover:bg-green-50 transition-all shadow-[4px_4px_0px_0px_rgba(34,197,94,0.1)]"
            >
              <MessageCircle size={18} />
              Dúvidas no WhatsApp
            </a>

            {selectedVariation && selectedVariation.stock <= 3 && selectedVariation.stock > 0 && (
              <p className="text-center text-orange-600 text-[10px] font-bold uppercase animate-pulse">
                🔥 Corra! Apenas {selectedVariation.stock} unidades disponíveis!
              </p>
            )}
          </div>

          {/* DESCRIÇÃO */}
          {product.description && (
            <div className="border-t pt-6 space-y-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Descrição</h2>
              <div className="relative">
                <div 
                  className={`text-gray-700 text-base leading-relaxed overflow-hidden transition-all duration-500 whitespace-pre-wrap break-words ${
                    !isDescriptionExpanded ? "max-h-[150px]" : "max-h-full"
                  }`}
                >
                  {product.description}
                </div>
                
                {product.description.length > 200 && (
                  <button 
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="flex items-center gap-1 text-black font-black mt-4 hover:underline border-b-2 border-black pb-0.5 text-xs uppercase tracking-tighter"
                  >
                    {isDescriptionExpanded ? (
                      <>Menos detalhes <ChevronUp size={16} /></>
                    ) : (
                      <>Ler descrição completa <ChevronDown size={16} /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MEDIDAS */}
          {(product.weight || product.height || product.width || product.length) && (
            <div className="p-4 border-2 border-black rounded-xl bg-gray-50 grid grid-cols-2 gap-4 text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <span className="text-gray-400 block uppercase font-black tracking-widest">Peso</span>
                <span className="font-bold text-gray-900">{product.weight || "-"} kg</span>
              </div>
              <div>
                <span className="text-gray-400 block uppercase font-black tracking-widest">Dimensões</span>
                <span className="font-bold text-gray-900">
                  {product.height || "0"}x{product.width || "0"}x{product.length || "0"} cm
                </span>
              </div>
            </div>
          )}

          {/* AVALIAÇÕES */}
          <div className="border-t pt-8 space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 italic">Opiniões de quem comprou</h2>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map(r => (
                    <div key={r.id} className="border-2 border-black rounded-xl p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-gray-900">{r.name}</p>
                        <div className="flex text-yellow-500">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} size={14} className="fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm italic break-words">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">Este produto ainda não tem avaliações. Seja o primeiro!</p>
              )}
              <ReviewForm productId={product.id} />
          </div>
        </div>
      </div>

      {/* PRODUTOS RELACIONADOS */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t-2 border-black">
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter italic">Você também pode gostar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(p => {
              const img = p.images[0]
              const url = typeof img === "string" ? img : img?.url ?? ""
              const relatedPix = p.price * 0.91
              return (
                <a href={`/produtos/${p.slug}`} key={p.id} className="group space-y-3 bg-white p-3 rounded-2xl border-2 border-transparent hover:border-black transition-all min-w-0 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="relative h-40 md:h-56 w-full overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                    <Image src={url} alt={p.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm truncate uppercase">{p.name}</h3>
                  <div className="space-y-0">
                    <p className="font-black text-gray-900 leading-tight text-lg">R$ {relatedPix.toFixed(2)}</p>
                    <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">No PIX (-9%)</p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}