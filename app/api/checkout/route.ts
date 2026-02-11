export const dynamic = 'force-dynamic';

import Stripe from "stripe"
import { NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
})

export async function POST(req: Request) {
  try {
    const { items, userEmail, address } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 })
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: "brl",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          // ✅ O Segredo para o Webhook não salvar "null" no banco:
          metadata: {
            productId: item.id, 
            size: item.size || "N/A",
            color: item.color || "N/A",
          },
        },
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // ✅ Voltamos para apenas 'card' para evitar o erro do Pix desativado
      payment_method_types: ["card"], 
      line_items: lineItems,
      
      metadata: {
        userEmail: userEmail ?? "",
        // Garantimos que o address seja uma string segura
        address: typeof address === 'object' ? JSON.stringify(address).slice(0, 450) : String(address || "").slice(0, 450),
      },

      // ✅ sessionId (CamelCase) para bater com sua página de sucesso
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/carrinho`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("❌ Erro checkout:", err.message)
    return NextResponse.json(
      { error: err.message || "Erro ao criar checkout" },
      { status: 500 }
    )
  }
}