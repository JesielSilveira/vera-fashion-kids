import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("data.id") || searchParams.get("id");
    const type = searchParams.get("type");

    if (type !== "payment" || !id) {
      return NextResponse.json({ received: true });
    }

    const payment = await new Payment(client).get({ id });

    if (payment.status === "approved") {
      const metadata = payment.metadata;
      const productItems = metadata?.product_items || []; 
      const userId = metadata?.user_id || metadata?.userId; 

      await prisma.order.create({
        data: {
          userId: userId && userId !== "guest" ? userId : null,
          mercadopagoId: String(payment.id), 
          total: Number(payment.transaction_amount),
          status: "PAID",
          // Ajuste para não quebrar se o endereço for um objeto JSON
          shippingAddress: typeof metadata?.address === 'object' 
            ? JSON.stringify(metadata.address) 
            : `${metadata?.address || 'Não informado'}`,
          
          items: {
            create: productItems.map((item: any) => {
              // Verifica se é frete pelo ID ou pela flag 'f'
              const isFreteItem = item.f === true || String(item.id).includes("frete");

              return {
                // ✅ CORREÇÃO: Passando o 'name' que o Prisma exigiu
                name: isFreteItem ? "Frete" : (item.n || "Produto"),
                
                // ✅ CORREÇÃO: Se for frete, productId deve ser null para não dar erro de chave estrangeira
                productId: isFreteItem ? null : item.id,
                
                quantity: Number(item.q),
                price: Number(item.p || 0), 
                size: item.s || null,
                color: item.c || null,
                isFrete: isFreteItem,
              };
            })
          }
        }
      });

      console.log(`✅ Webhook: Pedido MP_${payment.id} processado com sucesso!`);
      return NextResponse.json({ updated: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ ERRO WEBHOOK MERCADO PAGO:", error.message);
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}