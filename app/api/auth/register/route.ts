export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Dados inválidos" },
      { status: 400 }
    )
  }

  const exists = await prisma.user.findUnique({
    where: { email },
  })

  if (exists) {
    return NextResponse.json(
      { error: "Email já cadastrado" },
      { status: 409 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "USER", // 🔹 padrão
    },
  })

  return NextResponse.json({ success: true })
}

