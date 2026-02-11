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

    // 1️⃣ Evitar duplicidade (Seu Schema tem @unique no stripeSessionId)
    const alreadyExists = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
    })

    if (alreadyExists) {
      console.log("⚠️ Pedido já processado anteriormente:", session.id)
      return NextResponse.json({ received: true })
    }

    // 2️⃣ Buscar itens com EXPAND (Obrigatório para ler metadados do produto)
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    })

    const userEmail = session.metadata?.userEmail
    const addressString = session.metadata?.address || ""

    // 3️⃣ Localizar usuário (Seu Schema permite Order sem User - userId?)
    const user = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null

    try {
      // 4️⃣ Transação Atômica: Pedido + Itens + Estoque
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            stripeSessionId: session.id,
            userId: user?.id ?? null,
            total: (session.amount_total ?? 0) / 100,
            status: "PAID",
            shippingAddress: addressString, // Salvando o endereço que vem do checkout
            items: {
              create: lineItems.data.map((item) => {
                // ✅ Pega metadados do produto expandido
                const stripeProduct = item.price?.product as Stripe.Product
                const metadata = stripeProduct?.metadata || {}
                
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

        // 5️⃣ Atualizar Estoque (Baseado no seu Schema de Variation e Product)
        for (const item of order.items) {
          if (item.productId && !item.isFrete) {
            
            // Se houver variação (size/color), baixa o estoque da variação primeiro
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
            
            // Baixa estoque global do produto
            try {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } }
              })
            } catch (error) {
              console.warn(`⚠️ Produto ${item.productId} não encontrado para atualizar estoque global.`)
            }
          }
        }
      })

      console.log("✅ Pedido e estoque processados com sucesso!")
    } catch (error: any) {
      console.error("❌ Erro ao salvar no banco:", error.message)
      // Retornar 500 para o Stripe tentar novamente
      return new NextResponse("Database Error", { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}