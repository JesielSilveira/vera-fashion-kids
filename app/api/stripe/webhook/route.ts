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

    // 1. RECUPERANDO OS DADOS DO METADATA
    const userId = session.metadata?.userId;
    const address = session.metadata?.address || "Endereço não informado";
    
    // Transformamos a string de produtos de volta em um array de objetos
    const productData = JSON.parse(session.metadata?.productData || "[]");

    try {
      // 2. CRIANDO O PEDIDO NO BANCO
      const newOrder = await prisma.order.create({
        data: {
          userId: userId, // ✅ Resolve o erro de Foreign Key do usuário
          stripeSessionId: session.id,
          total: session.amount_total / 100,
          status: "PAID",
          shippingAddress: address,
          items: {
            // Criamos múltiplos itens baseados no que veio do checkout
            create: productData.map((item: any) => ({
              productId: item.id, // ✅ Resolve o erro de Foreign Key do produto
              quantity: item.q,
              price: item.p,
              name: "Produto Adquirido" // Você pode passar o nome no metadata se quiser
            }))
          }
        }
      });

      console.log("✅ SUCESSO: Pedido", newOrder.id, "atribuído ao usuário", userId);
      return NextResponse.json({ created: true, orderId: newOrder.id });

    } catch (dbError: any) {
      console.error("❌ ERRO NO PRISMA:", dbError.message);
      return new NextResponse(`Erro Prisma: ${dbError.message}`, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}