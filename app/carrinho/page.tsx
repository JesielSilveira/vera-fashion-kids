"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash } from "lucide-react"

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
  const [freteSelecionado, setFreteSelecionado] =
    useState<"pac" | "sedex" | null>(null)

  const produtos = useMemo(
    () =>
      items.filter(
        (i) => i.id !== FRETE_PAC_ID && i.id !== FRETE_SEDEX_ID
      ),
    [items]
  )

  // invalida frete apenas se mudar produtos
  useEffect(() => {
    setFrete(null)
    setFreteSelecionado(null)
    removeItem(FRETE_PAC_ID)
    removeItem(FRETE_SEDEX_ID)
  }, [produtos.map((p) => p.id).join(",")])

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
        body: JSON.stringify({
          cepDestino: cep,
          items: payload,
        }),
      })

      if (!res.ok) throw new Error("Erro ao calcular frete")

      const data: FreteResult = await res.json()
      setFrete(data)

      removeItem(FRETE_PAC_ID)
      removeItem(FRETE_SEDEX_ID)

      if (data.pac) {
        addFrete({
          id: FRETE_PAC_ID,
          slug: FRETE_PAC_ID,
          name: "Frete PAC",
          price: Number(data.pac.price) || 0,
          image: null,
          quantity: 1,
        })
        setFreteSelecionado("pac")
      }
    } catch (err) {
      console.error(err)
      alert("Erro ao calcular frete")
    } finally {
      setLoadingFrete(false)
    }
  }

  function selecionarFrete(tipo: "pac" | "sedex") {
    if (!frete) return

    const data = tipo === "pac" ? frete.pac : frete.sedex
    if (!data) return

    removeItem(FRETE_PAC_ID)
    removeItem(FRETE_SEDEX_ID)

    addFrete({
      id: tipo === "pac" ? FRETE_PAC_ID : FRETE_SEDEX_ID,
      slug: tipo === "pac" ? FRETE_PAC_ID : FRETE_SEDEX_ID,
      name: tipo === "pac" ? "Frete PAC" : "Frete SEDEX",
      price: Number(data.price) || 0,
      image: null,
      quantity: 1,
    })

    setFreteSelecionado(tipo)
  }

  const subtotal = produtos.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * item.quantity,
    0
  )

  const freteValor =
    Number(
      items.find(
        (i) =>
          i.id === FRETE_PAC_ID || i.id === FRETE_SEDEX_ID
      )?.price
    ) || 0

  const total = subtotal + freteValor

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
      <h1 className="mb-8 text-3xl font-bold">Carrinho</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {items.map((item) => {
            const isFrete =
              item.id === FRETE_PAC_ID ||
              item.id === FRETE_SEDEX_ID

            return (
              <div
                key={`${item.id}-${item.size}-${item.color}`}
                className="flex gap-4 rounded-lg border p-4"
              >
                <div className="relative h-24 w-24">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <h2 className="font-semibold">{item.name}</h2>

                  <span className="mt-1 font-bold">
                    R$ {(Number(item.price) || 0).toFixed(2)}
                  </span>

                  {!isFrete && (
                    <div className="mt-auto flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          decrementItem(
                            item.id,
                            item.size,
                            item.color
                          )
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span>{item.quantity}</span>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          incrementItem(
                            item.id,
                            item.size,
                            item.color
                          )
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          removeItem(
                            item.id,
                            item.size,
                            item.color
                          )
                        }
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <Input
            placeholder="Digite seu CEP"
            value={cep}
            onChange={(e) =>
              setCep(e.target.value.replace(/\D/g, ""))
            }
          />

          <Button
            className="w-full"
            onClick={calcularFrete}
            disabled={loadingFrete}
          >
            {loadingFrete ? "Calculando..." : "Calcular frete"}
          </Button>

          {frete?.pac && (
            <Button
              className="w-full"
              variant={
                freteSelecionado === "pac"
                  ? "default"
                  : "outline"
              }
              onClick={() => selecionarFrete("pac")}
            >
              PAC — R$ {(Number(frete.pac.price) || 0).toFixed(2)} •{" "}
              {frete.pac.deadline} dias
            </Button>
          )}

          {frete?.sedex && (
            <Button
              className="w-full"
              variant={
                freteSelecionado === "sedex"
                  ? "default"
                  : "outline"
              }
              onClick={() => selecionarFrete("sedex")}
            >
              SEDEX — R$ {(Number(frete.sedex.price) || 0).toFixed(2)} •{" "}
              {frete.sedex.deadline} dias
            </Button>
          )}

          <div className="flex justify-between font-bold border-t pt-4">
            <span>Total</span>
            <span>R$ {(Number(total) || 0).toFixed(2)}</span>
          </div>

          <Link href="/checkout">
            <Button
              className="w-full"
              disabled={!freteSelecionado}
            >
              Finalizar compra
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
