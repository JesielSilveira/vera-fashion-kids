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
    
    // Extraindo dados do metadata que enviamos no checkout
    const userId = session.metadata?.userId;
    const address = session.metadata?.address || "Endereço via Stripe";
    const productData = JSON.parse(session.metadata?.productData || "[]");

    try {
      // Criando o pedido com as relações CORRETAS
      const newOrder = await prisma.order.create({
        data: {
          userId: userId, // ✅ Preenche o userId (Screenshot 56)
          stripeSessionId: session.id,
          total: session.amount_total / 100,
          status: "PAID",
          shippingAddress: address,
          items: {
            create: productData.map((item: any) => ({
              productId: item.id, // ✅ Preenche o productId (Screenshot 57)
              quantity: item.q,
              price: item.p,
              name: "Produto Comprado" 
            }))
          }
        }
      });

      console.log("✅ PEDIDO CRIADO COM SUCESSO:", newOrder.id);
      return NextResponse.json({ created: true });

    } catch (dbError: any) {
      console.error("❌ ERRO NO PRISMA AO SALVAR:", dbError.message);
      return new NextResponse(`Erro Banco: ${dbError.message}`, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}