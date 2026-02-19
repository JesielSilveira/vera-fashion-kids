"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/cart-store"

type FreteResult = {
  pac?: { price: number; deadline: number }
  sedex?: { price: number; deadline: number }
}

const FRETE_PAC_ID = "frete-pac"
const FRETE_SEDEX_ID = "frete-sedex"

export default function CartPage() {
  const {
    items,
    incrementItem,
    decrementItem,
    removeItem,
    addFrete,
  } = useCartStore()

  const [cep, setCep] = useState("")
  const [frete, setFrete] = useState<FreteResult | null>(null)
  const [loadingFrete, setLoadingFrete] = useState(false)
  const [freteSelecionado, setFreteSelecionado] = useState<"pac" | "sedex" | null>(null)

  // Filtra apenas produtos reais para cálculo e exibição
  const produtos = useMemo(
    () => items.filter((i) => i.id !== FRETE_PAC_ID && i.id !== FRETE_SEDEX_ID),
    [items]
  )

  // Invalida frete se o carrinho mudar
  useEffect(() => {
    setFrete(null)
    setFreteSelecionado(null)
    removeItem(FRETE_PAC_ID)
    removeItem(FRETE_SEDEX_ID)
  }, [produtos.map((p) => `${p.id}-${p.size}-${p.color}`).join(",")])

  async function calcularFrete() {
    if (cep.length !== 8) {
      alert("CEP inválido")
      return
    }
    if (produtos.length === 0) {
      alert("Carrinho vazio")
      return
    }

    try {
      setLoadingFrete(true)
      const payload = produtos.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        weight: 0.3,
        height: 5,
        width: 15,
        length: 20,
      }))

      const res = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cepDestino: cep, items: payload }),
      })

      if (!res.ok) throw new Error("Erro ao calcular frete")

      const data: FreteResult = await res.json()
      setFrete(data)

      // Limpa seleções anteriores
      removeItem(FRETE_PAC_ID)
      removeItem(FRETE_SEDEX_ID)

      // Auto-seleciona PAC se disponível
      if (data.pac) {
        selecionarFrete("pac", data)
      }
    } catch (err) {
      console.error(err)
      alert("Erro ao calcular frete")
    } finally {
      setLoadingFrete(false)
    }
  }

  function selecionarFrete(tipo: "pac" | "sedex", dataInput?: FreteResult) {
    const source = dataInput || frete
    if (!source) return

    const data = tipo === "pac" ? source.pac : source.sedex
    if (!data) return

    removeItem(FRETE_PAC_ID)
    removeItem(FRETE_SEDEX_ID)

    addFrete({
      id: tipo === "pac" ? FRETE_PAC_ID : FRETE_SEDEX_ID,
      slug: tipo === "pac" ? "pac" : "sedex",
      name: tipo === "pac" ? "Frete PAC" : "Frete SEDEX",
      price: Number(data.price) || 0,
      image: null,
      quantity: 1,
    })

    setFreteSelecionado(tipo)
  }

  const subtotal = produtos.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0)
  const freteValor = items.find((i) => i.id === FRETE_PAC_ID || i.id === FRETE_SEDEX_ID)?.price || 0
  const total = subtotal + freteValor
  const totalPix = total * 0.91 // Aplica o desconto de 9% sobre tudo (Produtos + Frete)

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-black uppercase italic">Seu carrinho está vazio</h1>
        <Link href="/">
          <Button className="rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold uppercase">
            Voltar para a loja
          </Button>
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-black uppercase italic tracking-tighter text-pink-600">Meu Carrinho</h1>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        {/* LISTA DE PRODUTOS */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => {
            const isFrete = item.id === FRETE_PAC_ID || item.id === FRETE_SEDEX_ID

            return (
              <div
                key={`${item.id}-${item.size}-${item.color}`}
                className={`flex gap-4 rounded-3xl border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isFrete ? 'bg-gray-50 border-dashed opacity-80' : ''}`}
              >
                <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-pink-50 text-pink-300">
                      <Truck size={32} />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-center">
                  <h2 className="font-black uppercase text-sm leading-tight text-gray-800">{item.name}</h2>
                  
                  {/* EXIBIÇÃO DAS VARIÁVEIS */}
                  {!isFrete && (
                    <div className="flex gap-2 mt-1">
                      {item.size && (
                        <span className="text-[10px] font-black uppercase bg-pink-100 text-pink-600 px-2 py-0.5 rounded">
                          TAM: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="text-[10px] font-black uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                          COR: {item.color}
                        </span>
                      )}
                    </div>
                  )}

                  <span className="mt-2 text-lg font-black text-pink-600">
                    R$ {(Number(item.price) || 0).toFixed(2)}
                  </span>

                  {!isFrete && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-white rounded-md"
                          onClick={() => decrementItem(item.id, item.size, item.color)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-white rounded-md"
                          onClick={() => incrementItem(item.id, item.size, item.color)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 ml-auto"
                        onClick={() => removeItem(item.id, item.size, item.color)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* RESUMO E FRETE */}
        <div className="rounded-3xl border-2 border-black p-6 space-y-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit sticky top-4">
          <h2 className="font-black text-xl uppercase italic">Resumo do Pedido</h2>
          
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-gray-400">Calcular Entrega</label>
            <div className="flex gap-2">
              <Input
                placeholder="00000-000"
                value={cep}
                className="rounded-xl border-2 border-gray-200 focus:border-black transition-all"
                onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
              />
              <Button 
                onClick={calcularFrete} 
                disabled={loadingFrete}
                className="bg-black hover:bg-gray-800 text-white rounded-xl px-6"
              >
                {loadingFrete ? "..." : "OK"}
              </Button>
            </div>
          </div>

          {/* OPÇÕES DE FRETE */}
          {frete && (
            <div className="space-y-2">
              {frete.pac && (
                <button
                  onClick={() => selecionarFrete("pac")}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                    freteSelecionado === "pac" ? "border-pink-500 bg-pink-50" : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <span className="flex flex-col items-start">
                    <span>PAC</span>
                    <span className="text-[10px] font-medium text-gray-500">{frete.pac.deadline} dias úteis</span>
                  </span>
                  <span>R$ {Number(frete.pac.price).toFixed(2)}</span>
                </button>
              )}
              {frete.sedex && (
                <button
                  onClick={() => selecionarFrete("sedex")}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                    freteSelecionado === "sedex" ? "border-pink-500 bg-pink-50" : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <span className="flex flex-col items-start">
                    <span>SEDEX</span>
                    <span className="text-[10px] font-medium text-gray-500">{frete.sedex.deadline} dias úteis</span>
                  </span>
                  <span>R$ {Number(frete.sedex.price).toFixed(2)}</span>
                </button>
              )}
            </div>
          )}

          <div className="space-y-3 border-t-2 border-black pt-6">
            <div className="flex justify-between font-bold text-gray-400 text-sm">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-400 text-sm">
              <span>Entrega</span>
              <span>{freteValor > 0 ? `R$ ${freteValor.toFixed(2)}` : "A calcular"}</span>
            </div>

            {/* BOX DE DESCONTO PIX */}
            <div className="bg-green-50 border-2 border-green-200 p-4 rounded-2xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-green-600 uppercase">Total no PIX</span>
                <span className="bg-green-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">-9% OFF</span>
              </div>
              <p className="text-2xl font-black text-green-700 leading-none">R$ {totalPix.toFixed(2)}</p>
            </div>

            <div className="flex justify-between font-black text-xl uppercase tracking-tighter pt-2">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <Link href="/checkout">
            <Button
              className="w-full h-14 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-black uppercase tracking-widest text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:bg-gray-300 disabled:shadow-none disabled:border-gray-400"
              disabled={!freteSelecionado || produtos.length === 0}
            >
              Ir para Pagamento
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}