import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound } from "next/navigation"

export default async function PedidoDetalhePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
    },
  })

  if (!order) return notFound()

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">
        Pedido #{order.id}
      </h1>

      <p className="text-sm text-muted-foreground">
        Data: {new Date(order.createdAt).toLocaleDateString("pt-BR")}
      </p>

      <div className="rounded-lg border p-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.product.name}
              {item.size || item.color
                ? ` (${item.size ?? "-"} / ${item.color ?? "-"})`
                : ""}{" "}
              x {item.quantity}
            </span>

            <span>
              R$ {(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="flex justify-between border-t pt-3 font-bold">
          <span>Total</span>
          <span>R$ {order.total.toFixed(2)}</span>
        </div>
      </div>
    </section>
  )
}
