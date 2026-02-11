export const dynamic = 'force-dynamic';
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    const { items, userEmail, userId, address } = await req.json();

    if (!items || items.length === 0) return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    if (!userId) return NextResponse.json({ error: "Usuário não identificado" }, { status: 401 });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: "brl",
        unit_amount: Math.round(item.price * 100),
        product_data: { name: item.name },
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        userId: userId,
        // Enviamos os detalhes dos itens para o Webhook processar
        productData: JSON.stringify(items.map((i: any) => ({
          productId: i.id, // ID que deve bater com o banco
          quantity: i.quantity,
          price: i.price,
          name: i.name
        }))).slice(0, 450), // Limite de caracteres do Stripe
        address: typeof address === 'object' ? JSON.stringify(address) : String(address || ""),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/carrinho`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}