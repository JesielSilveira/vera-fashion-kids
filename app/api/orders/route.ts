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

    // 2. Busca filtrada com os itens completos (incluindo variações)
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

    // 3. Formatação inteligente
    const formattedOrders = orders.map(order => {
      // Cálculo para identificar se foi Pix (se o total pago for menor que a soma dos itens)
      const sumItems = order.items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
      const isPix = order.total < sumItems && order.total > 0;

      return {
        ...order,
        isPix,
        // Formatação de moeda consistente
        displayTotal: order.total.toLocaleString('pt-br', { 
          style: 'currency', 
          currency: 'BRL' 
        }),
        // Badge de status amigável
        statusLabel: order.status === "PAID" ? "Pagamento Confirmado" : 
                     order.status === "PENDING" ? "Aguardando Pagamento" : "Cancelado"
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("ERRO AO BUSCAR PEDIDOS DO CLIENTE:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}