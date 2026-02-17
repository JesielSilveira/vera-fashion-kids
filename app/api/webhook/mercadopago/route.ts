import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Configuração com o Token que você pegou no painel
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("data.id") || searchParams.get("id");
    const type = searchParams.get("type");

    // O Mercado Pago envia notificações de vários tipos, queremos apenas 'payment'
    if (type !== "payment" || !id) {
      return NextResponse.json({ received: true });
    }

    // 1. Consultar os detalhes do pagamento no Mercado Pago
    const payment = await new Payment(client).get({ id });

    // 2. Verificar se o status é aprovado
    if (payment.status === "approved") {
      const metadata = payment.metadata;
      const productData = metadata?.product_details || [];
      const userId = metadata?.user_id;

      // 3. Criar o pedido no Prisma (mantendo sua estrutura)
      await prisma.order.create({
        data: {
          userId: userId && userId !== "guest" ? userId : null,
          // Trocamos stripeSessionId por mpPaymentId ou equivalente no seu schema
          stripeSessionId: String(payment.id), 
          total: Number(payment.transaction_amount),
          status: "PAID",
          shippingAddress: `${metadata?.address} | Tel: ${metadata?.phone}`,
          items: {
            create: productData.map((item: any) => ({
              productId: item.f ? null : item.id,
              name: item.n || "Produto",
              quantity: Number(item.q),
              price: Number(item.p),
              size: item.s || null,
              color: item.c || null,
              isFrete: item.f || false,
            }))
          }
        }
      });

      console.log(`✅ Pedido ${payment.id} aprovado e salvo no banco!`);
      return NextResponse.json({ updated: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("ERRO WEBHOOK MERCADO PAGO:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }
}