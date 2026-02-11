import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type PageProps = {
  // Ajustado para aceitar Promise, comum no Next.js moderno
  params: Promise<{ slug: string }> 
}

export default async function CategoryPage({ params }: PageProps) {
  // 1. Aguarda os params (necessário nas versões novas)
  const { slug } = await params

  if (!slug) notFound()

  // 2. Busca a categoria (adicionado await e log para debug)
  const category = await prisma.category.findUnique({
    where: { slug: slug },
  })

  // LOG DE DEBUG: Se der 404, olhe o terminal do VS Code e veja o que aparece
  console.log("Tentando acessar slug:", slug, "Encontrado:", category?.name)

  if (!category || !category.active) {
    return notFound()
  }

  const products = await prisma.product.findMany({
    where: { 
      active: true, 
      categoryId: category.id 
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold uppercase">{category.name}</h1>
        <p className="text-muted-foreground">Produtos da categoria</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 border rounded-lg">
           <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => {
            const images = (product.images ?? []) as string[]
            const image = images[0] ?? "/placeholder.png"

            return (
              <Link key={product.id} href={`/produtos/${product.slug}`}>
                <Card className="overflow-hidden hover:shadow-md transition border-none bg-muted/20">
                  <CardContent className="p-0">
                    <div className="relative h-44 w-full">
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="p-3 space-y-1">
                      <h3 className="font-medium line-clamp-2 text-sm">{product.name}</h3>
                      <p className="text-base font-bold text-blue-600">
                        R$ {product.price.toFixed(2)}
                      </p>
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