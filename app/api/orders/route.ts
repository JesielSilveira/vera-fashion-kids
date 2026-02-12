export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
// Importamos o authOptions direto da sua rota de autenticação
import { authOptions } from "@/app/api/auth/[...nextauth]/route" 

export async function GET() {
  try {
    // 1. Pegamos a sessão do usuário logado
    const session = await getServerSession(authOptions);

    // 2. Se não estiver logado ou não tiver ID, bloqueamos o acesso
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 3. O XEQUE-MATE: Filtramos apenas onde o userId é igual ao ID da sessão
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id, // 👈 Agora o usuário só vê os pedidos DELE
      },
      include: {
        items: true, // Inclui os itens (tamanho, cor, etc.) que o webhook salvou
      },
      orderBy: {
        createdAt: "desc", // Os mais recentes primeiro
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("ERRO MY-ORDERS:", error);
    return NextResponse.json({ error: "Erro ao buscar pedidos" }, { status: 500 });
  }
}