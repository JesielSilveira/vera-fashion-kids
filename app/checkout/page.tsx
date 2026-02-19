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

  // Cálculos de preço
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )
  
  // 🚀 Cálculo do desconto de 9% para visualização no Pix
  const totalPix = subtotal * 0.91

  async function handlePay() {
    // Validação básica de endereço
    if (!address.name || !address.phone || !address.street) {
      alert("Por favor, preencha os dados de entrega.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/checkout", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: session?.user?.email ?? null,
          userId: session?.user?.id ?? null,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size ?? "",
            color: item.color ?? "",
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
        <h1 className="mb-4 text-3xl font-bold font-black uppercase tracking-tighter">Seu carrinho está vazio</h1>
        <Link href="/">
          <Button className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase font-bold">Voltar para a loja</Button>
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-black uppercase tracking-tighter">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* ENDEREÇO */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4 text-primary">Dados de Entrega</h2>
            <Input placeholder="Nome completo"
              className="rounded-xl border-gray-300"
              onChange={(e) => setAddress(a => ({ ...a, name: e.target.value }))} />

            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Telefone com DDD"
                className="rounded-xl border-gray-300"
                onChange={(e) => setAddress(a => ({ ...a, phone: e.target.value }))} />
              <Input placeholder="Rua"
                className="rounded-xl border-gray-300"
                onChange={(e) => setAddress(a => ({ ...a, street: e.target.value }))} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input placeholder="Número"
                className="rounded-xl border-gray-300"
                onChange={(e) => setAddress(a => ({ ...a, number: e.target.value }))} />
              <Input placeholder="Cidade"
                className="rounded-xl border-gray-300"
                onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))} />
              <Input placeholder="Estado (Ex: RS)"
                className="rounded-xl border-gray-300"
                onChange={(e) => setAddress(a => ({ ...a, state: e.target.value }))} />
            </div>

            <Input placeholder="Complemento (opcional)"
              className="rounded-xl border-gray-300"
              onChange={(e) => setAddress(a => ({ ...a, complement: e.target.value }))} />
          </div>
        </div>

        {/* RESUMO */}
        <div className="border-2 border-black rounded-3xl p-6 space-y-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit">
          <h2 className="font-black text-xl uppercase tracking-tight">Resumo do pedido</h2>

          <div className="space-y-3 text-sm">
            {items.map((item, i) => (
              <div key={i} className="flex flex-col border-b border-dashed pb-3 last:border-0">
                <div className="flex justify-between font-bold text-gray-800">
                  <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {(item.size || item.color) && (
                  <span className="text-[10px] font-black uppercase text-primary mt-1">
                    TAM: {item.size} {item.color && `| COR: ${item.color}`}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ÁREA DE VALORES COM DESTAQUE NO PIX */}
          <div className="space-y-2 border-t border-black pt-4">
            <div className="flex justify-between text-sm font-bold text-gray-500">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-xl">
              <div>
                <p className="text-[10px] font-black uppercase text-green-600">No Pix (-9%)</p>
                <p className="text-xl font-black text-green-700">R$ {totalPix.toFixed(2)}</p>
              </div>
              <span className="text-xs font-bold text-green-600 bg-white px-2 py-1 rounded-full border border-green-200">Melhor opção</span>
            </div>

            <div className="flex justify-between pt-2 font-black text-lg uppercase tracking-tighter">
              <span>Total Cartão</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-800 py-7 rounded-2xl font-black uppercase tracking-widest text-lg transition-all active:scale-95"
          >
            {loading ? "Processando..." : "Ir para o Pagamento"}
          </Button>
          
          <p className="text-[10px] text-center text-gray-400 font-bold uppercase">
            Finalize no Mercado Pago em até 12x
          </p>
        </div>
      </div>
    </section>
  )
}