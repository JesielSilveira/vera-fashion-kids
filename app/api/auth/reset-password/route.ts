import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const bcrypt = require('bcrypt');

export async function POST(req: Request) {
  const { token, password } = await req.json()
  if (!token || !password)
    return NextResponse.json({ error: "Token e senha são obrigatórios" }, { status: 400 })

  const reset = await prisma.passwordReset.findUnique({ where: { token } })
  if (!reset || reset.expires < new Date())
    return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })

  const hashed = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: reset.userId },
    data: { password: hashed },
  })

  await prisma.passwordReset.delete({ where: { token } })

  return NextResponse.json({ ok: true })
}
