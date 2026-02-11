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
      // 1. Buscamos todos os IDs de produtos que realmente existem no banco agora
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: productData.map((p: any) => p.productId) } },
        select: { id: true }
      });
      const validIds = existingProducts.map(p => p.id);

      // 2. Criamos o pedido
      const newOrder = await prisma.order.create({
        data: {
          userId: userId,
          stripeSessionId: session.id,
          total: session.amount_total / 100,
          status: "PAID",
          shippingAddress: session.metadata?.address || "",
          items: {
            create: productData.map((item: any) => ({
              // 🛡️ A MÁGICA AQUI: 
              // Se o ID enviado não estiver nos IDs válidos do banco, enviamos NULL.
              // Isso evita o erro de Foreign Key e o pedido é criado com sucesso!
              productId: validIds.includes(item.productId) ? item.productId : null,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            }))
          }
        }
      });

      console.log("✅ Pedido criado com sucesso! Order ID:", newOrder.id);
      return NextResponse.json({ created: true });
    } catch (dbError: any) {
      console.error("❌ Erro fatal no Prisma:", dbError.message);
      return new NextResponse(`Erro Banco: ${dbError.message}`, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}