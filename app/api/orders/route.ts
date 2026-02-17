export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route" 

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 1. Bloqueio de segurança
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Busca filtrada
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id, 
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            price: true,
            size: true,
            color: true,
            isFrete: true,
          }
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Formatação (Opcional)
    // Se você quiser garantir que o frontend receba o desconto de 9% visível:
    const formattedOrders = orders.map(order => ({
      ...order,
      // Se o status for PAID e o valor for menor que o esperado, 
      // você pode identificar aqui que foi um Pix com desconto.
      displayTotal: order.total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("ERRO AO BUSCAR PEDIDOS DO CLIENTE:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}