export const dynamic = 'force-dynamic';

import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    const { items, userEmail, userId, address } = await req.json();

    // Validação básica
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Usuário não identificado" }, { status: 401 });
    }

    // Criando os itens para o Stripe mostrar na tela de pagamento
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: "brl",
        unit_amount: Math.round(item.price * 100), // Converte para centavos
        product_data: {
          name: item.name,
        },
      },
      quantity: item.quantity,
    }));

    // Criando a sessão do Stripe
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"], // Adicione "allow_promotion_codes: true" se quiser cupons
      line_items: lineItems,
      
      // O METADATA é o que "salva" o seu banco de dados depois
      metadata: {
        userId: userId, // 👈 ID do usuário para o pedido não ficar "órfão"
        userEmail: userEmail ?? "",
        address: typeof address === 'object' ? JSON.stringify(address).slice(0, 450) : String(address || "").slice(0, 450),
        // Guardamos o ID real do produto (productId) para o OrderItem do Prisma
        productData: JSON.stringify(items.map((i: any) => ({ 
          id: i.id, 
          q: i.quantity,
          p: i.price 
        }))).slice(0, 450)
      },

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/carrinho`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Erro checkout:", err.message);
    return NextResponse.json(
      { error: err.message || "Erro ao criar checkout" },
      { status: 500 }
    );
  }
}