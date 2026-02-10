"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500",
  PAID: "bg-blue-500",
  SHIPPED: "bg-purple-500",
  DELIVERED: "bg-green-500",
}

type Item = {
  id: string
  productId: string | null
  name: string
  quantity: number
  price: number
  size?: string | null
  color?: string | null
  isFrete: boolean
}

type Order = {
  id: string
  items: Item[]
  total: number
  status: string
  tracking?: string | null
  createdAt: string
}

export default function MinhaContaPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/minha-conta/orders")
        if (!res.ok) throw new Error("Falha ao buscar pedidos")
        const data: Order[] = await res.json()
        setOrders(data)
      } catch (err) {
        console.error(err)
        alert("Erro ao carregar pedidos")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()

    // Polling a cada 10s
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  if (loading) return <p>Carregando pedidos...</p>

  if (orders.length === 0)
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold">Meus pedidos</h1>
        <p className="text-muted-foreground">
          Você ainda não realizou nenhuma compra.
        </p>
      </section>
    )

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">Meus pedidos</h1>

      {orders.map((order) => (
        <div key={order.id} className="rounded-lg border p-4 space-y-3">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <strong>Pedido #{order.id.slice(0, 8)}</strong>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            <Badge className={statusColors[order.status]}>
              {statusLabels[order.status] ?? order.status}
            </Badge>
          </div>

          {/* ITENS */}
          <div className="space-y-1 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.isFrete ? "🚚 Frete" : item.name}
                  {!item.isFrete && (
                    <>
                      {item.size && ` • Tam: ${item.size}`}
                      {item.color && ` • Cor: ${item.color}`}
                    </>
                  )}{" "}
                  × {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* RASTREIO */}
          {order.tracking && (
            <div className="rounded-md bg-muted p-3 text-sm space-y-1">
              <strong>Código de rastreio:</strong>
              <a
                href={`https://www.linkcorreios.com.br/?id=${order.tracking}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block font-mono text-blue-600 underline"
              >
                {order.tracking}
              </a>
              <span className="text-xs text-muted-foreground">
                Clique para acompanhar no site dos Correios
              </span>
            </div>
          )}

          {/* TOTAL */}
          <div className="flex justify-between border-t pt-3 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      ))}
    </section>
  )
}
