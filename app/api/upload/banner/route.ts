import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: "banners",
    })

    // ✅ ISSO É O MAIS IMPORTANTE
    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    })
  } catch (err) {
    console.error("UPLOAD ERROR:", err)
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 })
  }
}
