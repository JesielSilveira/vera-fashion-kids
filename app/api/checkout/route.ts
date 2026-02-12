export const dynamic = 'force-dynamic';
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: "2023-10-16" as any 
});

export async function POST(req: Request) {
  try {
    const { items, userId, address, phone } = await req.json();

    const lineItems = items.map((item: any) => {
      // 🚀 Cria um sufixo para o nome aparecer no Stripe (ex: "Camisa (G - Azul)")
      const variationLabel = [item.size, item.color].filter(Boolean).join(" - ");
      const displayName = variationLabel ? `${item.name} (${variationLabel})` : item.name;

      return {
        price_data: {
          currency: "brl",
          unit_amount: Math.round(item.price * 100),
          product_data: { 
            name: displayName,
          },
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        userId: userId || "guest",
        phone: phone || "", 
        // Se o endereço vier como objeto, vira string. Se não, usa o que vier.
        address: typeof address === 'object' ? JSON.stringify(address) : String(address),
        
        // 📦 DADOS PARA O SEU BANCO (JSON)
        // Usamos chaves curtas (n, q, p, s, c) para não estourar o limite de 500 caracteres do Stripe
        productData: JSON.stringify(items.map((i: any) => ({
          id: i.id,
          n: i.name,
          q: i.quantity,
          p: i.price,
          s: i.size || "", 
          c: i.color || "" 
        }))).slice(0, 480), // Margem de segurança
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/carrinho`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}