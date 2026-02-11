import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  try {
    const event = stripe.webhooks.constructEvent(
      body, 
      sig!, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      // Salvando o pedido apenas com o básico para teste
      await prisma.order.create({
        data: {
          stripeSessionId: session.id,
          total: session.amount_total / 100,
          status: "PAID",
          shippingAddress: "Endereço via Stripe",
          // Criamos um item genérico para não dar erro de ID de produto
          items: {
            create: [{
              name: "Produto Vendido",
              quantity: 1,
              price: session.amount_total / 100,
            }]
          }
        }
      });
      console.log("✅ PEDIDO SALVO NO BANCO!");
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ ERRO NO WEBHOOK:", err.message);
    return new NextResponse(`Erro: ${err.message}`, { status: 400 });
  }
}