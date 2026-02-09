"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"

export default function SuccessPage() {
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <section className="flex h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">
        Pagamento realizado com sucesso 🎉
      </h1>

      <Link href="/minha-conta">
        <Button>Ver meus pedidos</Button>
      </Link>

      <Link href="/">
        <Button variant="outline">
          Voltar para a loja
        </Button>
      </Link>
    </section>
  )
}
