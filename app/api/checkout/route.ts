export const dynamic = 'force-dynamic';
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" as any });

export async function POST(req: Request) {
  try {
    const { items, userId, address, phone } = await req.json();

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "brl",
        unit_amount: Math.round(item.price * 100),
        product_data: { 
          name: `${item.name}${item.size ? ` (${item.size})` : ""}${item.color ? ` (${item.color})` : ""}` 
        },
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        userId: userId || "guest",
        address: typeof address === 'object' ? JSON.stringify(address) : String(address),
        phone: phone || "",
        // 🚀 Payload compacto para o Webhook
        productData: JSON.stringify(items.map((i: any) => ({
          id: i.id,
          n: i.name,
          q: i.quantity,
          p: i.price,
          s: i.size || "",
          c: i.color || "",
          f: i.id.includes("frete") // flag de frete
        }))).slice(0, 480),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/carrinho`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}