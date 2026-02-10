export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"

import { Card, CardContent } from "@/components/ui/card"

export async function Categories() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, image: true },
  })

  if (categories.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="mb-8 text-2xl font-bold">Compre por categoria</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((category) => {
          const imgSrc = category.image ?? "/placeholder-category.jpg"

          return (
            <Link
              key={category.id}
              href={`/categoria/${category.slug}`}
              className="group block"
            >
              <Card className="overflow-hidden transition-transform duration-200 group-hover:scale-[1.03]">
                <CardContent className="relative p-0">
                  {/* Imagem com overlay e texto */}
                    <div className="relative h-40 w-full bg-muted">
                      {/* Usando img simples sem funções para não quebrar o build do servidor */}
                      <img
                        src={imgSrc}
                        alt={category.name}
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 z-10" />
                      <div className="absolute inset-0 flex items-center justify-center px-2 z-20">
                        <span className="text-center text-lg font-semibold text-white">
                          {category.name}
                        </span>
                      </div>
                    </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
