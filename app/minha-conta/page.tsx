import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
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

export default async function MinhaContaPage() {
  const session = await getServerSession(authOptions)

  const userEmail = session?.user?.email

  if (!userEmail) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold">
          Acesse sua conta
        </h1>
        <p className="text-muted-foreground">
          Faça login para visualizar seus pedidos.
        </p>
      </section>
    )
  }

  const orders = await prisma.order.findMany({
    where: {
      user: {
        email: userEmail,
      },
    },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">
        Meus pedidos
      </h1>

      {orders.length === 0 && (
        <p className="text-muted-foreground">
          Você ainda não realizou nenhuma compra.
        </p>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-lg border p-4 space-y-3"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <strong>
                Pedido #{order.id.slice(0, 8)}
              </strong>
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
              <div
                key={item.id}
                className="flex justify-between"
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
            <span>
              R$ {order.total.toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </section>
  )
}
