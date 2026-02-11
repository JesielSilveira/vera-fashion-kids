export const dynamic = 'force-dynamic';

import Stripe from "stripe"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16" as any,
})

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) return new NextResponse("Missing signature", { status: 400 })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    // 1️⃣ Evitar duplicidade
    const alreadyExists = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
    })

    if (alreadyExists) {
      console.log("⚠️ Pedido já processado anteriormente:", session.id)
      return NextResponse.json({ received: true })
    }

    // 2️⃣ Buscar itens com EXPAND para garantir acesso aos metadados do produto
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    })

    const userEmail = session.metadata?.userEmail
    const user = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null

    try {
      // 3️⃣ Transação Atômica: Pedido + Estoque
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            stripeSessionId: session.id,
            userId: user?.id ?? null,
            total: (session.amount_total ?? 0) / 100,
            status: "PAID",
            items: {
              create: lineItems.data.map((item) => {
                // Tenta pegar metadados do preço ou do produto expandido
                const product = item.price?.product as Stripe.Product
                const metadata = product?.metadata || item.price?.metadata || {}
                
                const isFrete = item.description?.toLowerCase().includes("frete") ?? false

                return {
                  productId: isFrete ? null : (metadata.productId as string),
                  name: item.description ?? "Produto",
                  quantity: item.quantity ?? 1,
                  price: (item.price?.unit_amount ?? 0) / 100,
                  size: metadata.size ?? null,
                  color: metadata.color ?? null,
                  isFrete,
                }
              }),
            },
          },
          include: { items: true }
        })

        // 4️⃣ Atualizar Estoque
        for (const item of order.items) {
          if (item.productId && !item.isFrete) {
            // Se houver variação, tenta baixar o estoque dela
            if (item.size || item.color) {
              await tx.variation.updateMany({
                where: {
                  productId: item.productId,
                  size: item.size,
                  color: item.color,
                },
                data: { stock: { decrement: item.quantity } }
              })
            } 
            
            // Baixa estoque geral do produto (usa try/catch interno para não travar o pedido)
            try {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } }
              })
            } catch (error) {
              console.warn(`⚠️ Não foi possível baixar estoque do produto ID: ${item.productId}`)
            }
          }
        }
      })

      console.log("✅ Pedido gravado no banco com sucesso:", session.id)
    } catch (error: any) {
      console.error("❌ Erro crítico ao salvar pedido no Prisma:", error)
      // Retornar 500 força o Stripe a tentar reenviar o webhook mais tarde
      return new NextResponse("Database error", { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}