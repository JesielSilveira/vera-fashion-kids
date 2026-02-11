"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/cart-store"

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore()
  const { data: session } = useSession()

  const [loading, setLoading] = useState(false)

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    number: "",
    city: "",
    state: "",
    complement: "",
  })

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

async function handlePay() {
  setLoading(true)

  try {
const res = await fetch("/api/checkout", { // 👈 Verifique se sua rota é /api/checkout
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userEmail: session?.user?.email ?? null,
    userId: session?.user?.id ?? null, // 🔥 O dono do pedido

    items: items.map((item) => ({
      id: item.id, // 🔥 O ID do produto no banco
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),

    address,
  }),
})

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Erro checkout")
    }

    const { url } = await res.json()
    window.location.href = url
  } catch (err) {
    console.error(err)
    alert("Erro ao iniciar pagamento")
    setLoading(false)
  }
}


  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">
          Seu carrinho está vazio
        </h1>
        <Link href="/">
          <Button>Voltar para a loja</Button>
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">

        {/* ENDEREÇO */}
        <div className="md:col-span-2 space-y-4">
          <Input placeholder="Nome completo"
            onChange={(e) => setAddress(a => ({ ...a, name: e.target.value }))} />

          <Input placeholder="Telefone"
            onChange={(e) => setAddress(a => ({ ...a, phone: e.target.value }))} />

          <Input placeholder="Rua"
            onChange={(e) => setAddress(a => ({ ...a, street: e.target.value }))} />

          <Input placeholder="Número"
            onChange={(e) => setAddress(a => ({ ...a, number: e.target.value }))} />

          <Input placeholder="Cidade"
            onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))} />

          <Input placeholder="Estado"
            onChange={(e) => setAddress(a => ({ ...a, state: e.target.value }))} />

          <Input placeholder="Complemento (opcional)"
            onChange={(e) => setAddress(a => ({ ...a, complement: e.target.value }))} />
        </div>

        {/* RESUMO */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-lg">Resumo do pedido</h2>

          <div className="space-y-2 text-sm">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>

          <Button
            onClick={handlePay}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Redirecionando..." : "Finalizar pagamento"}
          </Button>
        </div>
      </div>
    </section>
  )
}
