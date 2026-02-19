export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { MessageCircle } from "lucide-react" // Importando o ícone

export async function FeaturedProducts() {
  // 🔹 Busca produtos ativos em destaque
  const products = await prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  })

  if (!products || products.length === 0) return null

  const whatsappNumber = "5554991844554" // 👈 COLOQUE SEU NÚMERO AQUI (DDI + DDD + NUMERO)

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="mb-8 text-2xl font-bold uppercase tracking-tight">Produtos em destaque</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => {
          const images = (product.images ?? []) as string[]
          const image = images[0] ?? "/placeholder.png"
          
          // Cálculo do preço com desconto de 9% para o Pix (exibição na home ajuda a vender)
          const pixPrice = product.price * 0.91

          return (
            <Card key={product.id} className="flex flex-col border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <Link href={`/produtos/${product.slug}`} className="block">
                  <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg">
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      style={{ objectFit: "contain" }}
                      className="transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <h3 className="mb-2 text-sm font-bold line-clamp-2 uppercase h-10">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="mt-2">
                  <p className="text-xs text-green-600 font-bold uppercase">No Pix (-9%)</p>
                  <span className="text-xl font-black text-gray-900">
                    R$ {pixPrice.toFixed(2)}
                  </span>
                  <p className="text-[10px] text-gray-400">Ou R$ {product.price.toFixed(2)} no cartão</p>
                </div>
              </CardContent>

              <CardFooter className="mt-auto p-4 flex flex-col gap-2">
                {/* Botão Ver Produto */}
                <Link href={`/produtos/${product.slug}`} className="w-full">
                  <Button className="w-full font-bold uppercase text-xs bg-[#2fc3c6]">Ver produto</Button>
                </Link>

                {/* NOVO: Botão Assistência WhatsApp */}
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=Olá! Vi o produto ${product.name} na loja e gostaria de tirar algumas dúvidas.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 w-full py-2 border-2 border-green-500 text-green-600 rounded-md font-black uppercase text-[10px] hover:bg-green-50 transition-all"
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </a>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </section>
  )
}