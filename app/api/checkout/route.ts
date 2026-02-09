import Stripe from "stripe"
import { NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
})

export async function POST(req: Request) {
  try {
    const { items, userEmail, address } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Carrinho vazio" },
        { status: 400 }
      )
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      items.map((item: any) => ({
        price_data: {
          currency: "brl",
          product_data: {
            name: item.name,
            metadata: {
              size: item.size ?? "",
              color: item.color ?? "",
            },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }))

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,

      metadata: {
        userEmail: userEmail ?? "",
        address: JSON.stringify(address ?? {}),
        cart: JSON.stringify(items),
      },

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("❌ Erro checkout:", err)
    return NextResponse.json(
      { error: "Erro ao criar checkout" },
      { status: 500 }
    )
  }
}
