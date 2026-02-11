export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma"
import { NextResponse, NextRequest } from "next/server"
import { transporter } from "@/lib/mail"

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await context.params
    const { status, tracking } = await req.json()

    // 1. Busca e atualiza
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status, tracking },
    })

    // 2. Envio de E-mail (dentro de um try isolado para não travar a API)
    if (order.user?.email) {
      try {
        await transporter.sendMail({
          from: `"Vera Fashion Kids" <${process.env.SMTP_USER}>`,
          to: order.user.email,
          subject: `Atualização: Pedido #${order.id.slice(0, 8)}`,
          html: `
            <div style="font-family: sans-serif; color: #333;">
              <h2>Olá ${order.user.name || "Cliente"},</h2>
              <p>O status do seu pedido <strong>#${order.id.slice(0, 8)}</strong> mudou!</p>
              <p style="font-size: 1.2rem;"><strong>Novo Status:</strong> <span style="color: #2563eb;">${status}</span></p>
              ${tracking ? `
                <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                  <p><strong>Código de Rastreio:</strong> ${tracking}</p>
                  <a href="https://www.linkcorreios.com.br/?id=${tracking}" 
                     style="display: inline-block; padding: 10px 20px; background: #059669; color: white; text-decoration: none; border-radius: 5px;">
                     Acompanhar Entrega
                  </a>
                </div>
              ` : ""}
              <p style="margin-top: 20px;">Dúvidas? Entre em contato conosco.</p>
              <p><strong>Vera Fashion Kids ❤️</strong></p>
            </div>
          `,
        })
      } catch (mailErr) {
        console.error("❌ Falha ao enviar e-mail, mas banco atualizado:", mailErr)
      }
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("❌ Erro no PATCH:", error.message)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}