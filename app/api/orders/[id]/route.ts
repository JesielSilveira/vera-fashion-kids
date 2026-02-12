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

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!order) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    const updated = await prisma.order.update({
      where: { id },
      data: { status, tracking },
    });

    if (order.user?.email) {
      await transporter.sendMail({
        from: `"Vera Fashion Kids" <${process.env.SMTP_USER}>`,
        to: order.user.email,
        subject: `Seu pedido #${order.id.slice(-6).toUpperCase()} foi atualizado!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #db2777;">Vera Fashion Kids</h2>
            <p>Olá, <strong>${order.user.name}</strong>!</p>
            <p>O status do seu pedido foi atualizado para: <strong>${status}</strong></p>
            ${tracking ? `
              <div style="background: #fdf2f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Código de Rastreio:</strong> ${tracking}</p>
                <a href="https://www.linkcorreios.com.br/?id=${tracking}" 
                   style="display: inline-block; margin-top: 10px; padding: 10px 20px; background: #db2777; color: white; text-decoration: none; border-radius: 5px;">
                   Rastrear meu Pacote
                </a>
              </div>
            ` : ""}
            <p style="font-size: 12px; color: #999;">Obrigado por escolher nossa loja!</p>
          </div>
        `,
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}