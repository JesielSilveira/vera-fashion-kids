import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email obrigatório" },
        { status: 400 }
      )
    }

    await prisma.newsletterEmail.create({
      data: { email },
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    // evita erro se email já existir
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Erro ao cadastrar email" },
      { status: 500 }
    )
  }
}
