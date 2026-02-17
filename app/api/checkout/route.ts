export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuração do Mercado Pago com o seu Access Token do .env
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 } 
});

export async function POST(req: Request) {
  try {
    const { items, userId, address, phone, userEmail } = await req.json();

    console.log("DEBUG CHECKOUT MERCADO PAGO:", JSON.stringify(items));

    // 1. Mapear itens e aplicar metadados de variação
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
          email: userEmail || "test_user_123@testuser.com", // Email do comprador
        },
        // 🚀 LÓGICA DE DESCONTO E MÉTODOS
        payment_methods: {
          excluded_payment_types: [
            { id: "ticket" } // Exclui boleto para focar em Pix e Cartão
          ],
          installments: 12,
        },
        // Configuramos o desconto de 9% para o meio de pagamento Pix
        // Nota: No Checkout Pro, o MP pode mostrar o desconto direto se configurado no painel,
        // mas via API garantimos passando no metadata para o seu sistema de Orders.
        metadata: {
          userId: userId || "guest",
          address: JSON.stringify(address),
          phone: phone || "",
          pix_discount_percent: 9, // Referência para o seu webhook/admin
          product_details: items.map((i: any) => ({
            id: i.id,
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
      },
    });

    // O Mercado Pago retorna 'init_point' que é a URL do checkout
    return NextResponse.json({ url: response.init_point });

  } catch (err: any) {
    console.error("ERRO CRÍTICO NO CHECKOUT MERCADO PAGO:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}