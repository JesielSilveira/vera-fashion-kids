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
  } catch (err: any) { return new NextResponse(`Error: ${err.message}`, { status: 400 }); }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const productData = JSON.parse(session.metadata?.productData || "[]");

    try {
      // Validamos se os produtos existem no banco para evitar erro de Foreign Key
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: productData.map((p: any) => p.id) } },
        select: { id: true }
      });
      const validIds = existingProducts.map(p => p.id);

      await prisma.order.create({
        data: {
          userId: session.metadata.userId,
          stripeSessionId: session.id,
          total: session.amount_total / 100,
          status: "PAID",
          shippingAddress: `${session.metadata.address} | Tel: ${session.metadata.phone}`,
          items: {
            create: productData.map((item: any) => ({
              productId: validIds.includes(item.id) ? item.id : null,
              name: item.n,
              quantity: item.q,
              price: item.p,
              size: item.s, // 👈 Salvando Tamanho
              color: item.c // 👈 Salvando Cor
            }))
          }
        }
      });
      return NextResponse.json({ created: true });
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error.message);
      return new NextResponse("Erro Interno", { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}