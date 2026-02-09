"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"

type ProductButton = {
  id: string
  slug: string
  name: string
  price: number
  images?: { url: string }[]
  sizes?: string[]
  colors?: string[]
}

export function AddToCartButton({
  product,
}: {
  product: ProductButton
}) {
  const addItem = useCartStore((s) => s.addItem)

  const [size, setSize] = useState<string | undefined>()
  const [color, setColor] = useState<string | undefined>()

  const firstImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0].url
      : ""

  function handleAdd() {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: firstImage,
      },
      size,
      color
    )
  }

  const requiresSize = Array.isArray(product.sizes) && product.sizes.length > 0
  const requiresColor = Array.isArray(product.colors) && product.colors.length > 0

  const disabled =
    (requiresSize && !size) ||
    (requiresColor && !color)

  return (
    <div className="space-y-4">
      {/* TAMANHOS */}
      {requiresSize && (
        <div>
          <p className="font-medium mb-2">Tamanho</p>
          <div className="flex gap-2 flex-wrap">
            {product.sizes!.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-4 py-2 rounded-lg border text-sm transition
                  ${
                    size === s
                      ? "border-black bg-black text-white"
                      : "hover:bg-muted"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CORES */}
      {requiresColor && (
        <div>
          <p className="font-medium mb-2">Cor</p>
          <div className="flex gap-2 flex-wrap">
            {product.colors!.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`px-4 py-2 rounded-lg border text-sm transition
                  ${
                    color === c
                      ? "border-black bg-black text-white"
                      : "hover:bg-muted"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handleAdd}
        disabled={disabled}
        className="w-full h-12 text-base font-semibold rounded-xl"
      >
        {disabled ? "Selecione as opções" : "Adicionar ao carrinho"}
      </Button>
    </div>
  )
}
