import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" as any });

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) { 
    return new NextResponse(`Error: ${err.message}`, { status: 400 }); 
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const productData = JSON.parse(session.metadata?.productData || "[]");
    const userId = session.metadata?.userId;

    try {
      await prisma.order.create({
        data: {
          userId: userId && userId !== "guest" ? userId : null,
          stripeSessionId: session.id,
          total: (session.amount_total || 0) / 100,
          status: "PAID",
          shippingAddress: `${session.metadata?.address} | Tel: ${session.metadata?.phone}`,
          items: {
            create: productData.map((item: any) => ({
              // 1. productId: Se for frete, deve ser null. Se for produto, o ID deve existir no banco.
              productId: item.f ? null : item.id,
              name: item.n,
              quantity: item.q,
              price: item.p,
              // 2. size e color: strings simples conforme seu Schema
              size: item.s || null,
              color: item.c || null,
              // 3. isFrete: Booleano obrigatório no seu Schema
              isFrete: item.f || false,
            }))
          }
        }
      });

      return NextResponse.json({ created: true });
    } catch (error: any) {
      console.error("ERRO PRISMA:", error.message);
      // Retornamos 500 para depuração, mas o log acima dirá o campo exato
      return new NextResponse(`DB Error: ${error.message}`, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}