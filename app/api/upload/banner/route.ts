import { NextResponse } from "next/server"
import { cloudinary } from "@/lib/cloudinary"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const data = await req.formData()
  const file = data.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const upload = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "banners" },
      (err, result) => {
        if (err) reject(err)
        else resolve(result)
      }
    ).end(buffer)
  })

  return NextResponse.json({ url: upload.secure_url })
}