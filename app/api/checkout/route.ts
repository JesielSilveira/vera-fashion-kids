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

    // 1️⃣ Mapeamos os itens garantindo que o Metadata vá para o PRODUTO
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: "brl",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [], // Adiciona imagem no checkout se existir
          metadata: {
            // ESSENCIAL: O Webhook lê daqui para salvar no banco
            productId: item.id, 
            size: item.size || "N/A",
            color: item.color || "N/A",
          },
        },
      },
      quantity: item.quantity,
    }))

    // 2️⃣ Criamos a sessão
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Ativamos cartão e pix para melhorar suas vendas
      payment_method_types: ["card", "pix"], 
      line_items: lineItems,
      
      // Expira em 30 minutos se não pagar (bom para controle de estoque)
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), 

      metadata: {
        userEmail: userEmail ?? "",
        address: typeof address === 'string' ? address : JSON.stringify(address ?? "").slice(0, 450),
      },

      // ✅ AJUSTE NA URL: Usando sessionId para bater com o que a sua página de sucesso busca
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