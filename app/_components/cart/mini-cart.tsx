"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"

export function MiniCart() {
  const items = useCartStore((state) => state.items)

  const quantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <Link href="/carrinho" className="relative">
      <Button variant="ghost" size="icon">
        <ShoppingCart className="h-5 w-5" />
      </Button>

      {quantity > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {quantity}
        </span>
      )}
    </Link>
  )
}
