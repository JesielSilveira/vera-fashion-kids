import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Category = {
  id: string
  name: string
  slug: string
  image: string | null
  active: boolean
}

export default async function AdminCategoriesPage() {
  // 🔹 busca categorias do banco
  const categories: Category[] = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categorias</h1>

        <Link href="/admin/categorias/nova">
          <Button>Novo</Button>
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhuma categoria encontrada.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/admin/categorias/${category.id}`}
              className="group"
            >
              <Card className="overflow-hidden transition-transform duration-200 group-hover:scale-[1.03]">
                <CardContent className="relative p-0">
                  <div className="relative h-40 w-full">
                    <Image
                      src={category.image ?? "/categories/default.jpg"}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {category.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
