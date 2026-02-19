export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { transporter } from "@/lib/mail";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { status, tracking } = await req.json();

  // Mapeamento simples para o e-mail ficar mais amigável
  const statusMap: Record<string, string> = {
    PAID: "Pagamento Confirmado",
    SHIPPED: "Enviado / Em Transporte",
    DELIVERED: "Entregue com Sucesso",
    CANCELED: "Pedido Cancelado",
  };

  const statusFriendly = statusMap[status] || status;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

    const updated = await prisma.order.update({
      where: { id },
      data: { status, tracking },
    });

    if (order.user?.email) {
      try {
        await transporter.sendMail({
          from: `"Vera Fashion Kids" <${process.env.SMTP_USER}>`,
          to: order.user.email,
          subject: `Atualização: Pedido #${order.id.slice(-6).toUpperCase()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h2 style="color: #db2777; text-align: center;">Vera Fashion Kids</h2>
              <p>Olá, <strong>${order.user.name || "Cliente"}</strong>!</p>
              <p>O status do seu pedido foi atualizado para: <span style="color: #db2777; font-weight: bold;">${statusFriendly}</span></p>
              
              ${tracking ? `
                <div style="background: #fdf2f8; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px dashed #db2777;">
                  <p style="margin: 0;"><strong>Código de Rastreio:</strong> ${tracking}</p>
                  <p style="font-size: 14px; margin-top: 5px;">Você já pode acompanhar o trajeto dos seus produtos!</p>
                  <a href="https://www.linkcorreios.com.br/?id=${tracking}" 
                     style="display: inline-block; margin-top: 10px; padding: 12px 25px; background: #db2777; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                      Rastrear meu Pacote
                  </a>
                </div>
              ` : ""}
              
              <p style="margin-top: 20px;">Dúvidas? Responda a este e-mail ou entre em contato pelo nosso WhatsApp.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999; text-align: center;">Vera Fashion Kids - Moda com amor para os pequenos.</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error("ERRO AO ENVIAR E-MAIL:", mailError);
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("ERRO NO PATCH ORDER:", error.message);
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 500 });
  }
}