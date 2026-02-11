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

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Faltando configuração de assinatura", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("❌ Erro de assinatura:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // 1️⃣ Verificação de duplicidade
    const alreadyExists = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (alreadyExists) {
      return NextResponse.json({ received: true });
    }

    // 2️⃣ Busca detalhada com expand (Essencial para metadata)
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    });

    // 3️⃣ Localizar Usuário com segurança
    const userEmail = session.metadata?.userEmail;
    const user = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null;

    try {
      await prisma.$transaction(async (tx) => {
        // 4️⃣ Criação do Pedido
        const order = await tx.order.create({
          data: {
            stripeSessionId: session.id,
            userId: user?.id ?? null,
            total: Number((session.amount_total ?? 0) / 100), // Convertendo para Float (Number)
            status: "PAID",
            shippingAddress: session.metadata?.address || "",
            items: {
              create: lineItems.data.map((item) => {
                const stripeProduct = item.price?.product as Stripe.Product;
                const metadata = stripeProduct?.metadata || {};
                const isFrete = item.description?.toLowerCase().includes("frete") ?? false;
                
                // Pegamos o productId que você enviou no Checkout
                const pId = metadata.productId as string || null;

                return {
                  productId: isFrete ? null : pId,
                  name: item.description ?? "Produto",
                  quantity: item.quantity ?? 1,
                  price: Number((item.price?.unit_amount ?? 0) / 100),
                  size: metadata.size || null,
                  color: metadata.color || null,
                  isFrete,
                };
              }),
            },
          },
          include: { items: true },
        });

        // 5️⃣ Atualização de Estoque com TRY/CATCH para não quebrar a transação se o ID for inválido
        for (const item of order.items) {
          if (item.productId && !item.isFrete) {
            try {
              // Se tiver variação, tenta atualizar
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

              // Atualiza produto principal
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
              });
            } catch (stockError) {
              console.warn(`⚠️ Erro ao baixar estoque do produto ${item.productId}:`, stockError);
              // Não damos throw aqui para o pedido ser salvo mesmo se o estoque falhar
            }
          }
        }
      }, {
        timeout: 10000 // Aumenta o tempo da transação para MySQL lento
      });

      console.log("✅ Pedido salvo com sucesso no Banco!");
    } catch (error: any) {
      console.error("❌ Erro fatal no Prisma:", error.message);
      return new NextResponse(`Erro ao salvar pedido: ${error.message}`, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}