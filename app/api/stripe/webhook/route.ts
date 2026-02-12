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
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 }); 
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // 1. Extrair os metadados enviados pelo checkout
    const productData = JSON.parse(session.metadata?.productData || "[]");
    const userId = session.metadata?.userId;
    const address = session.metadata?.address || "Não informado";
    const phone = session.metadata?.phone || "Não informado";

    try {
      // 2. Filtrar IDs para evitar erro de FK (Foreign Key) caso seja um item de frete
      const idsParaValidar = productData
        .filter((p: any) => p.id && !p.id.includes("frete"))
        .map((p: any) => p.id);

      const existingProducts = await prisma.product.findMany({
        where: { id: { in: idsParaValidar } },
        select: { id: true }
      });
      
      const validIds = existingProducts.map(p => p.id);

      // 3. Criar o Pedido e os Itens
      await prisma.order.create({
        data: {
          userId: userId,
          stripeSessionId: session.id,
          total: (session.amount_total || 0) / 100,
          status: "PAID",
          shippingAddress: `${address} | Tel: ${phone}`,
          items: {
            create: productData.map((item: any) => ({
              // Se o ID for válido no banco, conecta, senão deixa null (ex: frete)
              productId: validIds.includes(item.id) ? item.id : null,
              name: item.n,
              quantity: item.q,
              price: item.p,
              // 🚀 AQUI ESTÁ O SEGREDO DO JSON:
              // Salvamos tamanho e cor dentro de um único campo objeto JSON
              variation: {
                size: item.s || null,
                color: item.c || null
              }
            }))
          }
        }
      });

      console.log(`✅ Pedido criado com sucesso para a sessão: ${session.id}`);
      return NextResponse.json({ created: true });

    } catch (error: any) {
      console.error("❌ Erro ao processar banco de dados:", error.message);
      return new NextResponse("Database Error", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}