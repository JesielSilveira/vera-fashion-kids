import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    console.log("🔍 Buscando pedido para a sessão:", sessionId);

    if (!sessionId) return new NextResponse("Falta sessionId", { status: 400 });

    const order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: { items: true },
    });

    if (!order) {
      console.log("⚠️ Pedido ainda não encontrado no banco de dados.");
      return new NextResponse("Ainda processando...", { status: 404 });
    }

    console.log("✅ Pedido encontrado!");
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("❌ ERRO NO CHECK:", error.message);
    return new NextResponse(error.message, { status: 500 });
  }
}