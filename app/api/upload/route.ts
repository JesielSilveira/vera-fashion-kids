import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const data = await req.formData()
    const file = data.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")

    // Salva no banco
    const banner = await prisma.banner.create({
      data: {
        title: data.get("title") as string,
        image: base64, // campo TEXT/LONGTEXT no DB
        categoryId: data.get("categoryId") as string,
        order: Number(data.get("order")),
        active: data.get("active") === "true",
      },
    })

    return NextResponse.json({ id: banner.id, image: base64 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 })
  }
}
