export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ShoppingCart, Flame, MessageCircle } from "lucide-react" // Adicionado MessageCircle
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export async function BestSellers() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { orders: { _count: "desc" } },
    take: 8,
  })

  if (!products || products.length === 0) return null

  const whatsappNumber = "5554991844554" // 👈 COLOQUE SEU NÚMERO AQUI (DDI + DDD + NUMERO)

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
        <h2 className="text-2xl font-black uppercase tracking-tight">Mais vendidos</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product, index) => {
          const images = (product.images ?? []) as string[]
          const image = images[0] ?? "/placeholder.png"
          
          // Cálculo do preço com desconto de 9% para o Pix
          const pixPrice = product.price * 0.91

          return (
            <Card key={product.id} className="flex flex-col border-gray-200 hover:shadow-lg transition-all group">
              <CardContent className="p-4">

                {/* ranking */}
                <Badge className="mb-3 w-fit bg-black text-white hover:bg-black font-bold">
                  #{index + 1} MAIS VENDIDO
                </Badge>

                {/* imagem */}
                <Link href={`/produtos/${product.slug}`} className="block">
                  <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg">
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      style={{ objectFit: "contain" }}
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </Link>

                {/* nome */}
                <Link href={`/produtos/${product.slug}`}>
                  <h3 className="mb-2 text-sm font-bold line-clamp-2 uppercase h-10 hover:underline">
                    {product.name}
                  </h3>
                </Link>

                {/* preço com destaque Pix */}
                <div className="mt-2">
                  <p className="text-[10px] text-green-600 font-black uppercase">No Pix (-9%)</p>
                  <span className="text-xl font-black text-gray-900 leading-none">
                    R$ {pixPrice.toFixed(2)}
                  </span>
                  <p className="text-[10px] text-gray-400 font-medium">Ou R$ {product.price.toFixed(2)} no cartão</p>
                </div>
              </CardContent>

              {/* botões */}
              <CardFooter className="mt-auto p-4 flex flex-col gap-2">
                <Link href={`/produtos/${product.slug}`} className="w-full">
                  <Button className="w-full gap-2 font-bold uppercase text-xs">
                    <ShoppingCart className="h-3 w-3" />
                    Ver produto
                  </Button>
                </Link>

                {/* Botão Assistência WhatsApp */}
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=Olá! Vi que o produto ${product.name} é um dos mais vendidos e gostaria de saber mais.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 w-full py-2 border-2 border-green-500 text-green-600 rounded-md font-black uppercase text-[10px] hover:bg-green-50 transition-all"
                >
                  <MessageCircle size={14} />
                  Dúvidas no WhatsApp
                </a>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </section>
  )
}