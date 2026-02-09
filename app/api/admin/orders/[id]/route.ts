import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { transporter } from "@/lib/mail"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { status, tracking } = await req.json()

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { email: true, name: true } },
    },
  })

  if (!order) {
    return NextResponse.json(
      { error: "Pedido não encontrado" },
      { status: 404 }
    )
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: {
      status,
      tracking,
    },
  })

  // 📧 ENVIA EMAIL SE TIVER USUÁRIO
  if (order.user?.email) {
    await transporter.sendMail({
      from: `"Vera Fashion Kids" <${process.env.SMTP_USER}>`,
      to: order.user.email,
      subject: "Atualização do seu pedido",
      html: `
        <p>Olá ${order.user.name || ""},</p>

        <p>Seu pedido <strong>#${order.id.slice(0, 8)}</strong> foi atualizado.</p>

        <p>
          <strong>Status:</strong> ${status}
        </p>

        ${
          tracking
            ? `<p><strong>Rastreio:</strong> ${tracking}</p>`
            : ""
        }

        ${
          tracking
            ? `<p>
                <a href="https://www.linkcorreios.com.br/?id=${tracking}">
                  Acompanhar entrega
                </a>
              </p>`
            : ""
        }

        <p>Obrigado por comprar conosco ❤️</p>
      `,
    })
  }

  return NextResponse.json(updated)
}
