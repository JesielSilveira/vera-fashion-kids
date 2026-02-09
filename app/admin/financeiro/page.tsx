import { prisma } from "@/lib/prisma"

export default async function FinanceiroPage() {
  const orders = await prisma.order.findMany({
    where: { status: "paid" },
  })

  const totalRevenue = orders.reduce((acc: number, order: any) => {
    return acc + Number(order.total)
  }, 0)

  const totalOrders = orders.length

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayRevenue = orders
    .filter((o: any) => {
      return new Date(o.createdAt) >= today
    })
    .reduce((acc: number, o: any) => {
      return acc + Number(o.total)
    }, 0)

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-bold">
        Painel financeiro
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Receita total
          </p>
          <strong className="text-3xl">
            R$ {totalRevenue.toFixed(2)}
          </strong>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Pedidos pagos
          </p>
          <strong className="text-3xl">
            {totalOrders}
          </strong>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Receita hoje
          </p>
          <strong className="text-3xl">
            R$ {todayRevenue.toFixed(2)}
          </strong>
        </div>
      </div>
    </section>
  )
}
