export const dynamic = 'force-dynamic';

import Stripe from "stripe"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
})

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook error:", err)
    return new NextResponse("Webhook error", { status: 400 })
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // 🔒 Proteção contra webhook duplicado
  const alreadyExists = await prisma.order.findFirst({
    where: { stripeSessionId: session.id },
    select: { id: true },
  })

  if (alreadyExists) {
    return NextResponse.json({ received: true })
  }

  // 🔹 Itens pagos
  const lineItems = await stripe.checkout.sessions.listLineItems(
    session.id,
    { limit: 100 }
  )

  const userEmail = session.metadata?.userEmail ?? null

  const user = userEmail
    ? await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true },
      })
    : null

  const order = await prisma.order.create({
    data: {
      stripeSessionId: session.id,
      userId: user?.id ?? null,
      total: (session.amount_total ?? 0) / 100,
      status: "PAID",

      items: {
        create: lineItems.data.map((item) => {
          const metadata = item.price?.metadata ?? {}

          const isFrete =
            item.description?.toLowerCase().includes("frete") ?? false

          return {
            productId: isFrete ? null : metadata.productId ?? null,
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
  })

  console.log("✅ Pedido salvo:", order.id)

  return NextResponse.json({ received: true })
}
