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

    // Ignora notificações que não sejam de pagamento
    if (type !== "payment" || !id) {
      return NextResponse.json({ received: true });
    }

    // 1. Busca os detalhes do pagamento no Mercado Pago
    const payment = await new Payment(client).get({ id });

    if (payment.status === "approved") {
      const metadata = payment.metadata;
      const productItems = metadata?.product_items || []; 
      const userId = metadata?.user_id || metadata?.userId; 

      // 2. Cria o pedido no banco de dados
      await prisma.order.create({
        data: {
          userId: userId && userId !== "guest" ? userId : null,
          mercadopagoId: String(payment.id), 
          total: Number(payment.transaction_amount),
          status: "PAID",
          
          // Salva o endereço e o telefone juntos para facilitar sua vida
          shippingAddress: typeof metadata?.address === 'object' 
            ? `${JSON.stringify(metadata.address)} | Tel: ${metadata?.phone || 'N/A'}`
            : `${metadata?.address || 'Não informado'} | Tel: ${metadata?.phone || 'N/A'}`,
          
          items: {
            create: productItems.map((item: any) => {
              // Identifica se o item é frete (via flag 'f' ou ID)
              const isFreteItem = item.f === true || String(item.id).includes("frete");

              return {
                // Se for frete, salva o nome enviado (ex: Frete PAC). Se não, usa o nome do produto.
                name: item.n || (isFreteItem ? "Frete" : "Produto"),
                
                // IDs de frete (string) quebram o banco se ele espera Relation de Produto, então mandamos null
                productId: isFreteItem ? null : item.id,
                
                quantity: Number(item.q),
                price: Number(item.p || 0), 
                size: item.s || null,   // ✅ TAMANHO
                color: item.c || null, // ✅ COR
                isFrete: isFreteItem,  // ✅ TIPO DE ITEM
              };
            })
          }
        }
      });

      console.log(`✅ [Vera Fashion] Pedido MP_${payment.id} salvo no banco com sucesso!`);
      return NextResponse.json({ updated: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ ERRO WEBHOOK MERCADO PAGO:", error.message);
    // Respondemos 200 para o MP não ficar reenviando o erro infinitamente
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}