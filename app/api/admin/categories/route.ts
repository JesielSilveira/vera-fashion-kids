import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"

/* =========================
   GET - listar categorias
========================= */
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  return NextResponse.json(categories)
}

/* =========================
   POST - criar categoria
========================= */
export async function POST(req: Request) {
  try {
    const data = await req.formData()

    const file = data.get("file") as File | null
    const name = data.get("name") as string
    const slug = data.get("slug") as string
    const active = data.get("active") === "true"

    let imagePath: string | null = null

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const fileName =
        Date.now() + "-" + file.name.replace(/\s/g, "_")

      const filePath = path.join(
        process.cwd(),
        "public/uploads",
        fileName
      )

      await writeFile(filePath, buffer)
      imagePath = `/uploads/${fileName}`
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        active,
        image: imagePath,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || "Erro no upload" },
      { status: 500 }
    )
  }
}
