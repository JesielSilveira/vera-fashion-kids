"use client"

import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react" // Ícone para o filtro

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
  PENDING: "bg-yellow-500 hover:bg-yellow-600 text-white",
  PAID: "bg-blue-500 hover:bg-blue-600 text-white",
  SHIPPED: "bg-purple-500 hover:bg-purple-600 text-white",
  DELIVERED: "bg-green-500 hover:bg-green-600 text-white",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const intervalRef = useRef<number | null>(null)

  // =========================
  // Carrega pedidos
  // =========================
  async function loadOrders(isSilent = false) {
    try {
      if (!isSilent) setLoading(true)
      const res = await fetch("/api/orders")
      if (!res.ok) throw new Error("Erro ao carregar pedidos")
      const data: Order[] = await res.json()
      
      // Ordena por data (mais recente primeiro)
      const sortedData = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      setOrders(sortedData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()

    // Polling a cada 10 segundos (silencioso, sem mostrar "Carregando...")
    intervalRef.current = window.setInterval(() => loadOrders(true), 10000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // =========================
  // Filtro de busca
  // =========================
  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase()
    return (
      order.id.toLowerCase().includes(search) ||
      order.user?.name?.toLowerCase().includes(search) ||
      order.user?.email?.toLowerCase().includes(search)
    )
  })

  // =========================
  // Atualiza status ou rastreio
  // =========================
  async function updateOrder(
    orderId: string,
    data: Partial<{ status: Order["status"]; tracking: string }>
  ) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Erro ao atualizar pedido")

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...data } : o))
      )
    } catch (err) {
      console.error(err)
      alert("Erro ao atualizar pedido")
    }
  }

  if (loading && orders.length === 0) return <div className="p-10 text-center">Iniciando painel...</div>

  return (
    <section className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Gerenciar Pedidos</h1>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, nome ou email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <p className="text-center py-10 border rounded-lg text-muted-foreground">
            Nenhum pedido encontrado.
          </p>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-muted/30 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Pedido #{order.id.slice(-8).toUpperCase()}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {order.user?.name || "Cliente convidado"}
                    </span>
                    {order.user?.email && ` (${order.user.email})`}
                    <p>{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <Badge className={`${statusColors[order.status]} border-none`}>
                  {statusLabels[order.status]}
                </Badge>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                <div className="rounded-lg border bg-card p-3 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm border-b last:border-0 pb-1 last:pb-0">
                      <span>
                        <span className="font-semibold text-blue-600">{item.quantity}x</span>{" "}
                        {item.isFrete ? "🚚 Frete" : item.name}
                        {!item.isFrete && (item.size || item.color) && (
                          <span className="text-muted-foreground text-xs ml-2">
                            ({[item.size, item.color].filter(Boolean).join(" / ")})
                          </span>
                        )}
                      </span>
                      <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold">Total do Pedido</span>
                  <span className="font-black text-green-700">R$ {order.total.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Alterar Status</label>
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        updateOrder(order.id, { status: value as Order["status"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Código de Rastreio</label>
                    <Input
                      placeholder="Ex: BR123456789"
                      defaultValue={order.tracking ?? ""}
                      onBlur={(e) => {
                        if (e.target.value !== order.tracking) {
                          updateOrder(order.id, { tracking: e.target.value })
                        }
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  )
}