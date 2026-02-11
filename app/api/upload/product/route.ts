export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// 🔐 Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 }
      )
    }

    // 🔄 Converte para Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ☁️ Upload Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "products",
          resource_type: "image",
          transformation: [
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    return NextResponse.json(
      {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error("Erro upload product:", err)
    return NextResponse.json(
      { error: "Erro ao enviar imagem" },
      { status: 500 }
    )
  }
}
