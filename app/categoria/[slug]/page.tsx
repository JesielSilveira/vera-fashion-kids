import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type PageProps = {
  params: { slug: string }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = params

  if (!slug) notFound()

  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category || !category.active) notFound()

  const products = await prisma.product.findMany({
    where: { active: true, categoryId: category.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{category.name}</h1>
        <p className="text-muted-foreground">Produtos da categoria</p>
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground">Nenhum produto nesta categoria.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => {
            const images = (product.images ?? []) as string[]
            const image = images[0] ?? "/placeholder.png"

            return (
              <Link key={product.id} href={`/produtos/${product.slug}`}>
                <Card className="overflow-hidden hover:shadow-md transition">
                  <CardContent className="p-0">
                    <div className="relative h-44 w-full">
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="p-3 space-y-1">
                      <h3 className="font-medium line-clamp-2">{product.name}</h3>
                      <p className="text-sm font-semibold">R$ {product.price.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
