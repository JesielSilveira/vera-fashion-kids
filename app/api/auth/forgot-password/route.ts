// app/api/forgot-password/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transporter } from "@/lib/mail"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    // 1️⃣ Verifica se o usuário existe
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // não retorna erro real para não vazar info
      return NextResponse.json({ ok: true })
    }

    // 2️⃣ Cria token de redefinição
    const token = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 1000 * 60 * 60) // expira em 1h

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    })

    // 3️⃣ Envia email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`
    await transporter.sendMail({
      from: `"Vera Fashion" <${process.env.SMTP_USER}>`, // ⚠️ deve ser igual ao SMTP_USER
      to: email,
      subject: "Redefinição de senha",
      html: `
        <p>Olá, ${user.name || "usuário"}!</p>
        <p>Você solicitou redefinir sua senha. Clique no link abaixo:</p>
        <a href="${resetUrl}">Redefinir senha</a>
        <p>Se você não solicitou isso, ignore este email.</p>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Erro forgot-password:", err)
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 })
  }
}
