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
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalPix = subtotal * 0.91

  // Função para atualizar campos do endereço de forma segura
  const updateAddress = (field: string, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }))
  }

  async function handlePay() {
    if (!address.name || !address.phone || !address.street || !address.number) {
      alert("Por favor, preencha todos os dados de entrega obrigatórios.")
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
          // Passando itens com todas as variações para o Webhook salvar depois
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size || "",
            color: item.color || "",
            // Identifica se é frete para o backend tratar diferente
            isFrete: item.id.includes("frete") || item.name.toLowerCase().includes("frete")
          })),
          address,
          phone: address.phone,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao processar checkout")
      }

      const { url } = await res.json()
      // Redireciona para o Mercado Pago (Checkout Pro)
      window.location.href = url
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Erro ao iniciar pagamento")
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-black uppercase tracking-tighter">Seu carrinho está vazio</h1>
        <Link href="/">
          <Button className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            Voltar para a loja
          </Button>
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-black uppercase tracking-tighter italic">Finalizar Compra</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: FORMULÁRIO */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4 text-pink-600">Dados de Entrega</h2>
            
            <Input 
              placeholder="Nome completo de quem vai receber"
              className="rounded-xl border-gray-300"
              value={address.name}
              onChange={(e) => updateAddress("name", e.target.value)} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="WhatsApp com DDD"
                className="rounded-xl border-gray-300"
                value={address.phone}
                onChange={(e) => updateAddress("phone", e.target.value)} 
              />
              <Input 
                placeholder="Rua / Logradouro"
                className="rounded-xl border-gray-300"
                value={address.street}
                onChange={(e) => updateAddress("street", e.target.value)} 
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Input 
                placeholder="Número"
                className="rounded-xl border-gray-300"
                value={address.number}
                onChange={(e) => updateAddress("number", e.target.value)} 
              />
              <Input 
                placeholder="Cidade"
                className="rounded-xl border-gray-300"
                value={address.city}
                onChange={(e) => updateAddress("city", e.target.value)} 
              />
              <Input 
                placeholder="Estado (Ex: RS)"
                maxLength={2}
                className="rounded-xl border-gray-300 uppercase"
                value={address.state}
                onChange={(e) => updateAddress("state", e.target.value.toUpperCase())} 
              />
            </div>

            <Input 
              placeholder="Complemento, Bairro ou Referência"
              className="rounded-xl border-gray-300"
              value={address.complement}
              onChange={(e) => updateAddress("complement", e.target.value)} 
            />
          </div>
        </div>

        {/* COLUNA DIREITA: RESUMO */}
        <div className="border-2 border-black rounded-3xl p-6 space-y-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit sticky top-4">
          <h2 className="font-black text-xl uppercase tracking-tight">Resumo</h2>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {items.map((item, i) => (
              <div key={i} className="flex flex-col border-b border-dashed pb-3 last:border-0 border-gray-200">
                <div className="flex justify-between font-bold text-gray-800 text-sm">
                  <span className="truncate max-w-[180px]">{item.name}</span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-black uppercase text-pink-600">
                    {item.size && `TAM: ${item.size}`} {item.color && `| COR: ${item.color}`}
                  </span>
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold">QTD: {item.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t-2 border-black pt-4">
            <div className="flex justify-between text-sm font-bold text-gray-400">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            
            {/* DESTAQUE PIX 9% */}
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase text-green-600 tracking-wider">Pagando com PIX</span>
                <span className="text-[10px] font-bold text-white bg-green-600 px-2 py-0.5 rounded-md">-9% OFF</span>
              </div>
              <p className="text-2xl font-black text-green-700">R$ {totalPix.toFixed(2)}</p>
            </div>

            <div className="flex justify-between pt-2 font-black text-lg uppercase tracking-tighter text-gray-800">
              <span>Total Cartão</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-8 rounded-2xl font-black uppercase tracking-widest text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:bg-gray-400 disabled:shadow-none"
          >
            {loading ? "Preparando..." : "Finalizar Compra"}
          </Button>
          
          <div className="flex items-center justify-center gap-2">
             <span className="text-[10px] font-bold text-gray-400 uppercase">Pagamento Seguro via Mercado Pago</span>
          </div>
        </div>
      </div>
    </section>
  )
}