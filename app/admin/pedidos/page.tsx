"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

type OrderItem = {
  id: string
  name: string
  quantity: number
  price: number
  size?: string | null
  color?: string | null
  isFrete: boolean
}

type Order = {
  id: string
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED"
  total: number
  createdAt: string
  tracking?: string | null
  user?: {
    name?: string | null
    email?: string | null
  } | null
  items: OrderItem[]
}

const statusLabels = {
  PENDING: "Pendente",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
}

const statusColors = {
  PENDING: "bg-yellow-500",
  PAID: "bg-blue-500",
  SHIPPED: "bg-purple-500",
  DELIVERED: "bg-green-500",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      const res = await fetch("/api/admin/orders")
      if (!res.ok) {
        alert("Erro ao carregar pedidos")
        return
      }

      setOrders(await res.json())
      setLoading(false)
    }

    loadOrders()
  }, [])

  async function updateOrder(
    orderId: string,
    data: Partial<{ status: Order["status"]; tracking: string }>
  ) {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, ...data } : o
      )
    )
  }

  if (loading) return <p>Carregando pedidos...</p>

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Pedidos</h1>

      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Pedido #{order.id.slice(0, 8)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {order.user?.name ||
                  order.user?.email ||
                  "Cliente convidado"}{" "}
                •{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            <Badge className={statusColors[order.status]}>
              {statusLabels[order.status]}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm"
              >
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

                <span>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="flex justify-between border-t pt-3">
              <strong>Total</strong>
              <strong>
                R$ {order.total.toFixed(2)}
              </strong>
            </div>

            {/* STATUS */}
            <div className="max-w-xs space-y-2">
              <Select
                value={order.status}
                onValueChange={(value) =>
                  updateOrder(order.id, {
                    status: value as Order["status"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="PAID">Pago</SelectItem>
                  <SelectItem value="SHIPPED">Enviado</SelectItem>
                  <SelectItem value="DELIVERED">Entregue</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Código de rastreio"
                defaultValue={order.tracking ?? ""}
                onBlur={(e) =>
                  updateOrder(order.id, {
                    tracking: e.target.value,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
