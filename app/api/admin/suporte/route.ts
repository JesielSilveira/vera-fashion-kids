import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return new NextResponse("Campos obrigatórios faltando", { status: 400 })
    }

    const contact = await prisma.support.create({
      data: {
        name,
        email,
        message,
      },
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error("[SUPORTE_POST]", error)
    return new NextResponse("Erro Interno", { status: 500 })
  }
}