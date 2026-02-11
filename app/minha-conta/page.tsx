"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation" // Importação vital
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Sugestão para visual

// --- Configurações de Status ---
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

// --- Tipagens ---
type Item = {
  id: string
  name: string
  quantity: number
  price: number
  isFrete: boolean
}

type Order = {
  id: string
  items: Item[]
  total: number
  status: string
  createdAt: string
}

export default function MinhaContaPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingPayment, setCheckingPayment] = useState(!!sessionId)

  // Função para buscar todos os pedidos
  async function fetchOrders() {
    try {
      const res = await fetch("/api/admin/orders") // Verifique se essa rota atende o cliente ou só o admin
      if (!res.ok) throw new Error("Falha ao buscar pedidos")
      const data: Order[] = await res.json()
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }

  // Função para checar o pedido específico do Stripe
  async function checkOrder(sid: string) {
    try {
      const res = await fetch(`/api/orders/check?sessionId=${sid}`)
      if (res.status === 404) return false
      return res.ok
    } catch {
      return false
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    async function init() {
      try {
        if (sessionId) {
          setCheckingPayment(true)
          let tries = 0

          interval = setInterval(async () => {
            tries++
            const found = await checkOrder(sessionId)

            if (found || tries >= 12) { // Tenta por 24 segundos
              clearInterval(interval)
              await fetchOrders()
              setCheckingPayment(false)
            }
          }, 2000)
        } else {
          await fetchOrders()
        }
      } catch (err) {
        console.error(err)
      }
    }

    init()
    return () => { if (interval) clearInterval(interval) }
  }, [sessionId])

  if (loading) return <div className="p-10 text-center">Carregando seus dados...</div>

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Minha Conta</h1>

      {checkingPayment && (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 text-blue-800 rounded-lg animate-pulse">
          Estamos confirmando seu pagamento. Isso leva apenas alguns segundos...
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Meus Pedidos</h2>
        
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-center py-10 border rounded-lg">
            Você ainda não possui pedidos registrados.
          </p>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pedido #{order.id.slice(-6).toUpperCase()}
                </CardTitle>
                <Badge className={statusColors[order.status] || "bg-gray-500"}>
                  {statusLabels[order.status] || order.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-4">
                  Realizado em: {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                </div>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>R$ {item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between font-bold">
                  <span>Total</span>
                  <span>R$ {order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}