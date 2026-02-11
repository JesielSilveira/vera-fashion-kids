import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID ausente" }, { status: 400 })
    }

    // Buscamos o pedido pelo ID da sessão que o Stripe gerou
    const order = await prisma.order.findUnique({
      where: { 
        stripeSessionId: sessionId 
      },
      include: { 
        items: true // Importante para a página de sucesso mostrar os produtos
      } 
    })

    if (!order) {
      // Retornamos 404 enquanto o Webhook ainda não salvou no banco.
      // A sua página de sucesso vai entender isso e tentar de novo em 2 segundos.
      return new NextResponse("Aguardando processamento...", { status: 404 })
    }

    // Se achou, retorna o pedido completo!
    return NextResponse.json(order)
  } catch (error) {
    console.error("❌ Erro na rota de check:", error)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}