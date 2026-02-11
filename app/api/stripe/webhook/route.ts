import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;
    const productData = JSON.parse(session.metadata?.productData || "[]");

    try {
      // O Prisma cria o Order e os OrderItems numa única transação
      const newOrder = await prisma.order.create({
        data: {
          userId: userId, 
          stripeSessionId: session.id,
          total: session.amount_total / 100,
          status: "PAID",
          shippingAddress: session.metadata?.address || "Endereço via Stripe",
          items: {
            create: productData.map((item: any) => ({
              // O VILÃO: Se este ID não existir na tabela Product, o MySQL bloqueia.
              productId: item.id, 
              name: item.n,
              quantity: item.q,
              price: item.p,
            }))
          }
        }
      });

      console.log("✅ Pedido e Itens gravados com sucesso!");
      return NextResponse.json({ created: true });
    } catch (dbError: any) {
      console.error("❌ ERRO NO PRISMA:", dbError.message);
      return new NextResponse(`Erro Banco: ${dbError.message}`, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}