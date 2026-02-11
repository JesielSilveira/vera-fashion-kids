import { NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

export const dynamic = "force-dynamic";

// 🔐 Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Pegamos todos os arquivos enviados sob a chave "files" (conforme seu frontend)
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado ou arquivos vazios" }, 
        { status: 400 }
      );
    }

    // 🔄 Processamos todos os uploads em paralelo para maior velocidade
    const uploadPromises = files.map(async (file) => {
      // Validação básica de tamanho (ex: 5MB por imagem)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`Arquivo ${file.name} é muito grande (máx 5MB)`);
      }

      // Converte o arquivo para Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Retorna a Promise de upload do Cloudinary
      return new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "products", // Pasta no Cloudinary
            resource_type: "image",
            transformation: [
              { quality: "auto", fetch_format: "auto" } // Otimização automática
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!);
          }
        );
        stream.end(buffer);
      });
    });

    // Aguarda todos os uploads terminarem
    const results = await Promise.all(uploadPromises);

    // Mapeia apenas as URLs seguras (HTTPS) para retornar ao frontend
    const urls = results.map((result) => result.secure_url);

    return NextResponse.json({ urls }, { status: 201 });

  } catch (err: any) {
    console.error("Erro no processamento de upload:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao enviar imagens para o Cloudinary" },
      { status: 500 }
    );
  }
}