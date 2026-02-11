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
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchOrders() {
    const res = await fetch("/api/admin/orders")
    if (!res.ok) throw new Error("Falha ao buscar pedidos")
    const data: Order[] = await res.json()
    setOrders(data)
  }

  async function checkOrder(sessionId: string) {
    const res = await fetch(`/api/orders/check?sessionId=${sessionId}`)

    if (res.status === 404) return false
    if (!res.ok) throw new Error("Erro ao verificar pedido")

    return true
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    async function init() {
      try {
        // 🔁 CASO VOLTA DO STRIPE
        if (sessionId) {
          let tries = 0

          interval = setInterval(async () => {
            tries++

            const found = await checkOrder(sessionId)

            if (found) {
              clearInterval(interval)
              await fetchOrders()
              setLoading(false)
            }

            if (tries >= 10) {
              clearInterval(interval)
              setLoading(false)
            }
          }, 2000)

          return
        }

        // 📦 FLUXO NORMAL
        await fetchOrders()
      } catch (err) {
        console.error(err)
        alert("Erro ao carregar pedidos")
      } finally {
        if (!sessionId) setLoading(false)
      }
    }

    init()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [sessionId])
}