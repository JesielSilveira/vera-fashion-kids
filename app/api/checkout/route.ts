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

    // 1. Mapear itens
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
    
    const response = await preference.create({
      body: {
        items: mpItems,
        payer: {
          email: userEmail || "cliente@exemplo.com",
          // Opcional: adicionar phone aqui ajuda a liberar o checkout transparente
        },
        payment_methods: {
          // Mantendo vazio para aceitar CARTÃO, PIX e BOLETO
          excluded_payment_methods: [],
          excluded_payment_types: [], 
          installments: 12,
        },
        // Metadata para seu Webhook e Admin
        metadata: {
          userId: userId || "guest",
          address: typeof address === 'string' ? address : JSON.stringify(address),
          phone: phone || "",
          pix_discount_percent: 9,
          product_items: items.map((i: any) => ({
            id: i.id,
            q: i.quantity,
            s: i.size || "",
            c: i.color || ""
          }))
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/carrinho`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
      },
    });

    // Retornamos o init_point (Checkout Pro)
    return NextResponse.json({ url: response.init_point });

  } catch (err: any) {
    console.error("ERRO CRÍTICO NO CHECKOUT MERCADO PAGO:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}