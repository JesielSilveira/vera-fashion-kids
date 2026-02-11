export const dynamic = 'force-dynamic';

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
          },
          unit_amount: Math.round(item.price * 100),
          // ✅ CORREÇÃO 1: Mover metadados para o nível do PRICE
          // O seu webhook tenta ler de item.price.metadata. Se estiver no product_data, ele não acha o productId.
          metadata: {
            productId: item.id,
            size: item.size ?? "",
            color: item.color ?? "",
          },
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
        // cart: JSON.stringify(items), // Cuidado: metadados do Stripe têm limite de caracteres.
      },

      // ✅ CORREÇÃO 2: Adicionar o session_id na URL de retorno
      // Sem isso, sua página /success não sabe qual compra pesquisar no banco.
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
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