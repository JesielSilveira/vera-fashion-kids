export const dynamic = 'force-dynamic';
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: "2023-10-16" as any 
});

export async function POST(req: Request) {
  try {
    const { items, userId, address, phone } = await req.json();

    // Log para conferirmos se o seu carrinho está enviando size/color
    console.log("DEBUG CHECKOUT:", JSON.stringify(items));

    const lineItems = items.map((item: any) => {
      // Monta o nome com as variações para o recibo do Stripe
      const variantInfo = [item.size, item.color].filter(Boolean).join(" - ");
      const productName = variantInfo ? `${item.name} (${variantInfo})` : item.name;

      return {
        price_data: {
          currency: "brl",
          unit_amount: Math.round(item.price * 100),
          product_data: { 
            name: productName,
          },
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // 🚀 MANTIDO APENAS CARD PARA NÃO BUGAR NO MODO TESTE
      payment_method_types: ["card"], 
      line_items: lineItems,
      metadata: {
        userId: userId || "guest",
        address: typeof address === 'object' ? JSON.stringify(address) : String(address),
        phone: phone || "",
        // Mapeamento para o Webhook salvar no banco
        productData: JSON.stringify(items.map((i: any) => ({
          id: i.id,
          n: i.name,
          q: i.quantity,
          p: i.price,
          s: i.size || "",  // Se isso chegar "" no log, o erro é no front
          c: i.color || "", // Se isso chegar "" no log, o erro é no front
          f: i.id.includes("frete")
        }))).slice(0, 480),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/carrinho`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("ERRO NO CHECKOUT:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}