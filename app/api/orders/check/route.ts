import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId"); // Aqui o frontend deve passar o Preference ID ou Payment ID

    console.log("🔍 Buscando pedido para a sessão MP:", sessionId);

    if (!sessionId) return new NextResponse("Falta sessionId", { status: 400 });

    const order = await prisma.order.findFirst({
      where: { 
        // 🚀 Ajustado de stripeSessionId para o campo que você usa para Mercado Pago
        // Se no seu schema for outro nome (ex: paymentId), mude apenas a chave abaixo
        mercadopagoId: sessionId 
      },
      include: { items: true },
    });

    if (!order) {
      console.log("⚠️ Pedido ainda não encontrado no banco de dados.");
      return new NextResponse("Ainda processando...", { status: 404 });
    }

    // Se o pedido existe mas ainda não está pago (ex: Pix gerado mas não compensado)
    if (order.status !== "PAID") {
        return NextResponse.json({ ...order, status: "WAITING" });
    }

    console.log("✅ Pedido encontrado e pago!");
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("❌ ERRO NO CHECK:", error.message);
    return new NextResponse(error.message, { status: 500 });
  }
}