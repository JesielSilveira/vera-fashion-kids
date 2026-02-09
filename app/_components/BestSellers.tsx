import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ShoppingCart, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export async function BestSellers() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
    orderBy: {
      orders: {
        _count: "desc",
      },
    },
    take: 8,
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <Flame className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">
          Mais vendidos
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product, index) => {
          const images = (product.images ?? []) as string[]
          const image = images[0] ?? "/placeholder.png"

          return (
            <Card key={product.id} className="flex flex-col">
              <CardContent className="p-4">

                {/* ranking */}
                <Badge className="mb-2 w-fit">
                  #{index + 1} mais vendido
                </Badge>

                {/* imagem */}
                <Link href={`/produtos/${product.slug}`}>
                  <div className="relative mb-4 h-40 w-full">
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                </Link>

                {/* nome */}
                <h3 className="mb-2 text-sm font-medium line-clamp-2">
                  {product.name}
                </h3>

                {/* preço */}
                <span className="text-lg font-bold">
                  R$ {product.price.toFixed(2)}
                </span>
              </CardContent>

              {/* botão */}
              <CardFooter className="mt-auto p-4">
                <Link
                  href={`/produtos/${product.slug}`}
                  className="w-full"
                >
                  <Button className="w-full gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Ver produto
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
