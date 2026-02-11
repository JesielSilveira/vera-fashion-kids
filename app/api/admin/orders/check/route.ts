import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")

  if (!sessionId) return new NextResponse("Faltando ID", { status: 400 })

  try {
    const order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: { items: true } 
    })

    if (!order) return new NextResponse("Pedido não encontrado", { status: 404 })

    return NextResponse.json(order)
  } catch (error) {
    return new NextResponse("Erro no servidor", { status: 500 })
  }
}