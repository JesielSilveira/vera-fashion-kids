import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = "force-dynamic"
export const revalidate = 0

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[]
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // 🔹 UNWRAP DA PROMISE (OBRIGATÓRIO)
  const params = await searchParams

  console.log("🔎 searchParams resolvido:", params)

  const qParam = params?.q

  const rawQuery =
    typeof qParam === "string"
      ? qParam
      : Array.isArray(qParam)
      ? qParam.join(" ")
      : ""

  const query = rawQuery.trim()

  console.log("🔎 query normalizada:", query)

  if (!query) {
    console.warn("⚠️ Query vazia, abortando busca")
    return (
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-3xl font-bold">Buscar produtos</h1>
        <p className="mt-2 text-muted-foreground">
          Digite algo para buscar produtos.
        </p>
      </section>
    )
  }

  const results = await prisma.product.findMany({
    where: {
      active: true, // active = 1
      OR: [
        { name: { contains: query } },
        { slug: { contains: query } },
        { description: { contains: query } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  console.log("📦 resultados encontrados:", results.length)

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Resultado da busca</h1>
        <p className="text-muted-foreground">
          Buscando por: <strong>{query}</strong>
        </p>
      </div>

      {results.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhum produto encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {results.map((product) => {
            const images = (product.images ?? []) as string[]
            const image = images[0] ?? "/placeholder.png"

            return (
              <Link key={product.id} href={`/produto/${product.slug}`}>
                <Card className="overflow-hidden transition hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="relative h-44 w-full">
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="p-3 space-y-1">
                      <h3 className="line-clamp-2 font-medium">
                        {product.name}
                      </h3>
                      <p className="text-sm font-semibold">
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
