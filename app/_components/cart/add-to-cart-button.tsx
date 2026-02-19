"use client"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"

type ProductButton = {
  id: string
  slug: string
  name: string
  price: number
  image?: string | null // Ajustado para bater com o CartProduct do store
}

export function AddToCartButton({
  product,
  selectedSize,  // 👈 Agora recebe da página
  selectedColor, // 👈 Agora recebe da página
  disabled,      // 👈 A lógica de "está selecionado" vem de fora
}: {
  product: ProductButton
  selectedSize?: string
  selectedColor?: string
  disabled?: boolean
}) {
  const addItem = useCartStore((s) => s.addItem)

  function handleAdd() {
    // Agora ele envia exatamente o que foi selecionado na ProductClient
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      selectedSize,
      selectedColor
    )
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={disabled}
      className="w-full h-14 text-base font-black uppercase rounded-2xl bg-[#2fc3c6] hover:bg-[#28adaf] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
    >
      {disabled ? "Selecione as opções" : "Adicionar ao carrinho"}
    </Button>
  )
}