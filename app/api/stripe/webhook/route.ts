import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: "2023-10-16" as any 
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) { 
    console.error("Webhook Signature Error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 }); 
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    
    // 1. Parse seguro dos metadados
    let productData = [];
    try {
      productData = JSON.parse(session.metadata?.productData || "[]");
    } catch (e) {
      console.error("Erro ao dar parse no productData");
    }

    const userId = session.metadata?.userId;

    try {
      // 2. Criar o pedido usando os nomes exatos do seu Schema
      const newOrder = await prisma.order.create({
        data: {
          // Se o userId não existir ou for "guest", deixamos null (seu schema permite User?)
          userId: userId && userId !== "guest" ? userId : null,
          stripeSessionId: session.id,
          total: (session.amount_total || 0) / 100,
          status: "PAID", // Status inicial após pagamento
          shippingAddress: session.metadata?.address || "Não informado",
          // Nota: adicionei fallback para shippingPrice se você tiver o dado
          shippingPrice: 0, 
          items: {
            create: productData.map((item: any) => ({
              name: item.n,
              quantity: item.q,
              price: item.p,
              size: item.s || null,
              color: item.c || null,
              // 🚀 O PULO DO GATO: Definindo se é frete ou produto real
              isFrete: item.id === "frete-pac" || item.id === "frete-sedex" || !!item.f,
              // Só conecta o productId se ele não for um item de frete
              productId: (item.id && !item.id.includes("frete")) ? item.id : null,
            }))
          }
        }
      });

      console.log("✅ Pedido criado com sucesso no MySQL:", newOrder.id);
      return NextResponse.json({ created: true });

    } catch (dbError: any) {
      // Isso vai imprimir o erro exato do Prisma no seu console
      console.error("❌ ERRO CRÍTICO NO BANCO:");
      console.dir(dbError, { depth: null });
      
      // Retornamos 500 para o Stripe saber que houve erro, 
      // mas os logs acima te dirão se falta algum campo.
      return new NextResponse(`Database Error: ${dbError.message}`, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}