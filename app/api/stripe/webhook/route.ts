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
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ ERRO DE ASSINATURA:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    // 1. PEGANDO OS DADOS DO METADATA (O que enviamos no Checkout)
    const userId = session.metadata?.userId;
    const address = session.metadata?.address || "Endereço via Stripe";

    try {
      // 2. CRIANDO O PEDIDO VINCULADO AO USUÁRIO
      const newOrder = await prisma.order.create({
        data: {
          userId: userId, // 🔥 Agora o pedido tem o ID do dono!
          stripeSessionId: session.id,
          total: session.amount_total / 100,
          status: "PAID",
          shippingAddress: address,
          items: {
            create: [{
              name: "Produto Vendido", // Depois você pode mapear os itens reais do metadata aqui
              quantity: 1,
              price: session.amount_total / 100,
            }]
          }
        }
      });

      console.log("✅ PEDIDO SALVO COM SUCESSO! ID:", newOrder.id, "USER:", userId);
      return NextResponse.json({ created: true, id: newOrder.id });

    } catch (dbError: any) {
      console.error("❌ ERRO NO PRISMA:", dbError.message);
      return new NextResponse(`Erro no Banco: ${dbError.message}`, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}