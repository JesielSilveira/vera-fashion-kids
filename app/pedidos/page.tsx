"use client"

import { useSession } from "next-auth/react"
import { orders } from "@/lib/mock/orders"

export default function OrdersPage() {
  const { data: session } = useSession()

  if (!session?.user?.email) {
    return <p className="p-8">Faça login para ver seus pedidos</p>
  }

  const userOrders = orders.filter(
    (order) => order.userEmail === session.user.email
  )

  if (userOrders.length === 0) {
    return <p className="p-8">Você ainda não fez pedidos</p>
  }

  return (
    <section className="mx-auto max-w-4xl p-8 space-y-6">
      <h1 className="text-3xl font-bold">
        Meus pedidos
      </h1>

      {userOrders.map((order) => (
        <div
          key={order.id}
          className="rounded-lg border p-4 space-y-2"
        >
          <p className="text-sm text-muted-foreground">
            Pedido #{order.id.slice(0, 8)}
          </p>

          <p>Status: {order.status}</p>

          <p className="font-semibold">
            Total: R$ {order.total.toFixed(2)}
          </p>

          <p className="text-sm">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </section>
  )
}
