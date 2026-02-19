export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 } 
});

export async function POST(req: Request) {
  try {
    const { items, userId, address, phone, userEmail } = await req.json();

    // 1. Mapear itens para o Mercado Pago (O que o cliente vê na tela de pagamento)
    const mpItems = items.map((item: any) => {
      const variantInfo = [item.size, item.color].filter(Boolean).join(" - ");
      const productName = variantInfo ? `${item.name} (${variantInfo})` : item.name;

      return {
        id: item.id,
        title: productName,
        unit_price: Number(item.price), 
        quantity: Number(item.quantity),
        currency_id: "BRL",
      };
    });

    // 2. Criar a Preferência
    const preference = new Preference(client);
    
    // URL do seu site com o caminho do webhook
    const notificationUrl = "https://www.verafashionkidsespumoso.com.br/api/webhooks/mercadopago";

    const response = await preference.create({
      body: {
        items: mpItems,
        payer: {
          email: userEmail || "cliente@exemplo.com",
        },
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [], 
          installments: 12,
        },
        // Metadata: Dados que o seu sistema vai ler no Webhook para salvar no banco
        metadata: {
          userId: userId || "guest",
          address: typeof address === 'string' ? address : JSON.stringify(address),
          phone: phone || "",
          pix_discount_percent: 9, 
          product_items: items.map((i: any) => ({
            id: i.id,
            n: i.name,   // Nome do produto (Ex: Vestido Floral)
            q: i.quantity,
            p: i.price,  
            s: i.size || "",  // TAMANHO (Ex: P, G, 2 anos)
            c: i.color || "", // COR (Ex: Rosa, Azul)
            f: i.id.startsWith("frete") || i.isFrete || false // Identifica se é o item de FRETE
          }))
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/carrinho`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
        },
        auto_return: "approved",
        notification_url: notificationUrl,
      },
    });

    console.log(`✅ Checkout gerado com sucesso para: ${userEmail}`);
    return NextResponse.json({ url: response.init_point });

  } catch (err: any) {
    console.error("❌ ERRO CRÍTICO NO CHECKOUT:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}