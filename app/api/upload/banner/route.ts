import { NextResponse } from "next/server"
import { cloudinary } from "@/lib/cloudinary"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const data = await req.formData()
    const file = data.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const upload = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "banners" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary error:", error)
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(buffer)
    })

    return NextResponse.json({ url: upload.secure_url })
  } catch (err) {
    console.error("API upload error:", err)
    return NextResponse.json(
      { error: "Erro ao enviar imagem" },
      { status: 500 }
    )
  }
}