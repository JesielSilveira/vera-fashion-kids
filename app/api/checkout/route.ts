export const dynamic = 'force-dynamic';

import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    // 1. Adicionamos o 'userId' aqui (você deve enviar do frontend)
    const { items, userEmail, userId, address } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: "brl",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
        },
      },
      quantity: item.quantity,
    }));

    // 2. Criamos a sessão com o userId no metadata
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"], 
      line_items: lineItems,
      
      metadata: {
        userId: userId ?? "", // 🔥 CRUCIAL: O Webhook vai usar isso para o prisma.order.create
        userEmail: userEmail ?? "",
        address: typeof address === 'object' ? JSON.stringify(address).slice(0, 450) : String(address || "").slice(0, 450),
        // Guardamos os IDs dos produtos para o webhook processar depois
        productIds: JSON.stringify(items.map((i: any) => ({ id: i.id, q: i.quantity }))).slice(0, 450)
      },

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/carrinho`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Erro checkout:", err.message);
    return NextResponse.json(
      { error: err.message || "Erro ao criar checkout" },
      { status: 500 }
    );
  }
}