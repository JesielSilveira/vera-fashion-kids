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
            unit_amount: Math.round(item.price * 100), // Converte para centavos
            product_data: {
              name: item.name,
              // ✅ CORRETO PARA SEU SCHEMA:
              metadata: {
                productId: item.id, // O Webhook vai usar isso para o productId do OrderItem
                size: item.size || "",
                color: item.color || "",
              },
            },
          },
          quantity: item.quantity,
  }))

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"], // Adicione "pix" se quiser aceitar Pix também
      line_items: lineItems,

      metadata: {
        userEmail: userEmail ?? "",
        // Limitamos o endereço para não estourar os 500 caracteres do Stripe
        address: JSON.stringify(address ?? {}).slice(0, 450),
      },

      // ✅ session_id na URL para a página de sucesso conseguir buscar o pedido
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    // Esse log no terminal/Vercel vai te dizer o motivo exato do erro 500
    console.error("❌ Erro checkout:", err.message)
    return NextResponse.json(
      { error: err.message || "Erro ao criar checkout" },
      { status: 500 }
    )
  }
}