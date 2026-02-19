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

    // Mercado Pago avisa sobre várias coisas, queremos apenas o pagamento
    if (type !== "payment" || !id) {
      return NextResponse.json({ received: true });
    }

    // 1. Consultar os detalhes reais do pagamento para evitar fraudes
    const payment = await new Payment(client).get({ id });

    // 2. Verificar se o status é aprovado
    if (payment.status === "approved") {
      const metadata = payment.metadata;
      
      // 🚀 SINCRONIA: Usando os mesmos nomes que enviamos no Checkout
      const productItems = metadata?.product_items || []; 
      const userId = metadata?.user_id || metadata?.userId; 

      // 3. Criar o pedido no Prisma
      await prisma.order.create({
        data: {
          // Relaciona ao usuário se logado, senão null
          userId: userId && userId !== "guest" ? userId : null,
          
          // Importante: Salvamos o ID do MP no campo que o seu banco já tem
          mercadopagoId: String(payment.id), 
          
          total: Number(payment.transaction_amount),
          status: "PAID",
          shippingAddress: `${metadata?.address} | Tel: ${metadata?.phone}`,
          
          items: {
            create: productItems.map((item: any) => ({
              // Se for frete, não tem ID de produto físico
              productId: item.f ? null : item.id,
              quantity: Number(item.q),
              // Buscamos o preço original ou o enviado no metadata
              price: Number(item.p || 0), 
              size: item.s || null,
              color: item.c || null,
              isFrete: item.f || false,
            }))
          }
        }
      });

      console.log(`✅ Webhook: Pedido MP_${payment.id} processado com sucesso!`);
      return NextResponse.json({ updated: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ ERRO WEBHOOK MERCADO PAGO:", error.message);
    // Respondemos 200 para o MP parar de tentar enviar o mesmo erro, 
    // mas logamos o erro para você consertar.
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}