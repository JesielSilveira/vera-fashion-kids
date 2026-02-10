export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export async function FeaturedProducts() {
  // 🔹 Busca produtos ativos em destaque
  const products = await prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  })

  if (!products || products.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="mb-8 text-2xl font-bold">Produtos em destaque</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => {
          const images = (product.images ?? []) as string[]
          const image = images[0] ?? "/placeholder.png"

          return (
            <Card key={product.id} className="flex flex-col">
              <CardContent className="p-4">
                <Link href={`/produtos/${product.slug}`} className="block">
                  <div className="relative mb-4 h-40 w-full">
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      style={{ objectFit: "contain" }} // ✅ modo seguro Next.js 13+
                      className="rounded-lg"
                      sizes="100vw"
                    />
                  </div>
                  <h3 className="mb-2 text-sm font-medium line-clamp-2 hover:underline">
                    {product.name}
                  </h3>
                </Link>
                <span className="text-lg font-bold">
                  R$ {product.price.toFixed(2)}
                </span>
              </CardContent>

              <CardFooter className="mt-auto p-4">
                <Link href={`/produtos/${product.slug}`} className="w-full">
                  <Button className="w-full">Ver produto</Button>
                </Link>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
