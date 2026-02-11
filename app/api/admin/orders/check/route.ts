import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/orders/check?sessionId=cs_test_xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId é obrigatório" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        stripeSessionId: sessionId,
      },
    });

    // Webhook ainda não processou
    if (!order) {
      return NextResponse.json(
        { error: "Pedido ainda não encontrado" },
        { status: 404 }
      );
    }

    // Pedido encontrado
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("[ORDERS_CHECK]", error);
    return NextResponse.json(
      { error: "Erro ao verificar pedido" },
      { status: 500 }
    );
  }
}
