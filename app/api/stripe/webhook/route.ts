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
    const userId = session.metadata?.userId;
    const address = session.metadata?.address || "Endereço não informado";

    try {
      // 🚨 IMPORTANTE: Verifique se os nomes abaixo (userId, total, status) 
      // são EXATAMENTE iguais aos do seu arquivo schema.prisma
      const newOrder = await prisma.order.create({
        data: {
          userId: userId, // Liga o pedido ao usuário logado
          stripeSessionId: session.id,
          total: session.amount_total / 100,
          status: "PAID",
          shippingAddress: address,
          items: {
            create: [{
              name: "Produto Vendido",
              quantity: 1,
              price: session.amount_total / 100,
              // ⚠️ Se o seu banco exigir productId, o erro continuará até 
              // você passar um id real de produto aqui:
              // productId: "ID_REAL_DO_BANCO" 
            }]
          }
        }
      });

      console.log("✅ PEDIDO CRIADO:", newOrder.id);
      return NextResponse.json({ created: true });

    } catch (dbError: any) {
      console.error("❌ ERRO DETALHADO NO PRISMA:", dbError.message);
      // Retornamos o erro para você ver na aba "Response" do Stripe
      return new NextResponse(`Erro Prisma: ${dbError.message}`, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}