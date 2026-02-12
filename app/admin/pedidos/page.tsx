"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Package, Mail } from "lucide-react"

// Tipagem atualizada para refletir o que vem do seu Banco/Webhook
type OrderItem = {
  id: string
  name: string
  quantity: number
  price: number
  size?: string | null  // Pode vir direto
  color?: string | null // Pode vir direto
  variation?: any       // Ou pode vir dentro do campo JSON
  isFrete: boolean
}

type Order = {
  id: string
  status: string
  total: number
  createdAt: string
  tracking?: string | null
  shippingAddress?: string | null
  user?: {
    name?: string | null
    email?: string | null
  } | null
  items: OrderItem[]
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500 text-white",
  PAID: "bg-blue-500 text-white",
  SHIPPED: "bg-purple-500 text-white",
  DELIVERED: "bg-green-500 text-white",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  async function loadOrders(isSilent = false) {
    try {
      if (!isSilent) setLoading(true)
      const res = await fetch("/api/orders")
      if (!res.ok) throw new Error("Erro ao carregar")
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    const interval = setInterval(() => loadOrders(true), 15000)
    return () => clearInterval(interval)
  }, [])

  async function updateOrder(orderId: string, data: any) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Erro")
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o))
    } catch (err) {
      alert("Falha ao atualizar")
    }
  }

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && orders.length === 0) return <div className="p-10 text-center">Carregando pedidos...</div>

  return (
    <section className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Pedidos</h1>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar pedido..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden border-l-4 border-l-pink-500">
            <CardHeader className="bg-gray-50/50 border-b">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-sm text-gray-500 uppercase font-bold">
                    Pedido #{order.id.slice(-8).toUpperCase()}
                  </CardTitle>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span className="flex items-center gap-1 font-semibold text-pink-700">
                       {order.user?.name || "Cliente Vera Fashion"}
                    </span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {order.user?.email}</span>
                  </div>
                </div>
                <Badge className={statusColors[order.status] || "bg-gray-400"}>
                  {statusLabels[order.status] || order.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                    <MapPin className="w-3 h-3"/> Entrega
                  </h4>
                  <p className="text-sm bg-gray-50 p-3 rounded-md border text-gray-700">
                    {order.shippingAddress}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                    <Select value={order.status} onValueChange={(v) => updateOrder(order.id, { status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Rastreio</label>
                    <Input 
                      placeholder="Cód..." 
                      defaultValue={order.tracking || ""}
                      onBlur={(e) => updateOrder(order.id, { tracking: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                  <Package className="w-3 h-3"/> Itens
                </h4>
                <div className="border rounded-lg divide-y bg-white">
                  {order.items.map((item) => {
                    // 🚀 LÓGICA PARA EXTRAIR VARIACAO DO JSON OU CAMPOS DIRETOS
                    const displaySize = item.size || item.variation?.size;
                    const displayColor = item.color || item.variation?.color;

                    return (
                      <div key={item.id} className="p-3 flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                          <p><span className="font-bold text-pink-600">{item.quantity}x</span> {item.name}</p>
                          <div className="flex gap-2 mt-1">
                            {displaySize && <Badge variant="outline" className="text-[10px] bg-slate-50 border-pink-200">TAM: {displaySize}</Badge>}
                            {displayColor && <Badge variant="outline" className="text-[10px] bg-slate-50 border-blue-200">COR: {displayColor}</Badge>}
                          </div>
                        </div>
                        <span className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-500 font-bold">TOTAL PAGO</span>
                <span className="text-2xl font-black text-green-600">R$ {order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}