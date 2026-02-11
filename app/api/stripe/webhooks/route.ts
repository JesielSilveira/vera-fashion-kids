export const dynamic = 'force-dynamic';

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return new NextResponse("Missing signature", { status: 400 });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // 1️⃣ Evitar duplicidade de pedido
    const alreadyExists = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (alreadyExists) {
      return NextResponse.json({ received: true });
    }

    // 2️⃣ BUSCA DETALHADA: Expandir o produto para pegar o productId do metadata
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    });

    // 3️⃣ Localizar Usuário
    const userEmail = session.metadata?.userEmail;
    const user = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null;

    try {
      // 4️⃣ Transação Atômica: Salva tudo ou nada
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            stripeSessionId: session.id,
            userId: user?.id ?? null,
            total: (session.amount_total ?? 0) / 100,
            status: "PAID",
            shippingAddress: session.metadata?.address || "",
            items: {
              create: lineItems.data.map((item) => {
                const stripeProduct = item.price?.product as Stripe.Product;
                const metadata = stripeProduct?.metadata || {};
                const isFrete = item.description?.toLowerCase().includes("frete") ?? false;

                return {
                  productId: isFrete ? null : (metadata.productId as string),
                  name: item.description ?? "Produto",
                  quantity: item.quantity ?? 1,
                  price: (item.price?.unit_amount ?? 0) / 100,
                  size: metadata.size || null,
                  color: metadata.color || null,
                  isFrete,
                };
              }),
            },
          },
          include: { items: true },
        });

        // 5️⃣ Atualização de Estoque (Produto e Variação)
        for (const item of order.items) {
          if (item.productId && !item.isFrete) {
            
            // Se tiver tamanho ou cor, tenta baixar o estoque da Variation
            if (item.size || item.color) {
              await tx.variation.updateMany({
                where: {
                  productId: item.productId,
                  size: item.size,
                  color: item.color,
                },
                data: { stock: { decrement: item.quantity } },
              });
            }

            // Baixa o estoque geral do Produto
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }
      });

      console.log("✅ Webhook: Pedido criado e estoque atualizado!");
    } catch (error: any) {
      console.error("❌ Erro ao processar transação no Prisma:", error.message);
      return new NextResponse("Erro ao salvar pedido", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}