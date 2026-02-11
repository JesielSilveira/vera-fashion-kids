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

  // 1. Validação da Assinatura do Stripe
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

  // 2. Processamento do Evento
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    try {
      // Usamos await dentro de um try/catch específico para o banco
      const newOrder = await prisma.order.create({
        data: {
          stripeSessionId: session.id,
          total: session.amount_total / 100,
          status: "PAID",
          shippingAddress: "Endereço via Stripe",
          items: {
            create: [{
              name: "Produto Vendido",
              quantity: 1,
              price: session.amount_total / 100,
              // Se o seu modelo exigir productId, coloque um ID fixo de teste aqui
              // productId: "ID_DE_UM_PRODUTO_EXISTENTE" 
            }]
          }
        }
      });

      console.log("✅ PEDIDO SALVO NO BANCO! ID:", newOrder.id);
      return NextResponse.json({ created: true, id: newOrder.id });

    } catch (dbError: any) {
      // 🚨 SE CHEGAR AQUI, O STRIPE VAI MOSTRAR O ERRO NA ABA "RESPONSE"
      console.error("❌ ERRO AO GRAVAR NO BANCO:", dbError.message);
      return new NextResponse(`Erro no Prisma: ${dbError.message}`, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}