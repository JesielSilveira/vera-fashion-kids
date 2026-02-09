import Link from "next/link"
import { Plus, Pencil } from "lucide-react"
import { prisma } from "@/lib/prisma"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { order: "asc" },
  })

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-muted-foreground">
            Gerencie os banners exibidos no site
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/banners/nova">
            <Plus className="mr-2 h-4 w-4" />
            Novo banner
          </Link>
        </Button>
      </div>

      {/* TABELA */}
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="text-center">
                Ordem
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {banners
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell className="font-medium">
                    {banner.title}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {banner.link || "—"}
                  </TableCell>

                  <TableCell className="text-center">
                    {banner.order}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        banner.active
                          ? "default"
                          : "secondary"
                      }
                    >
                      {banner.active
                        ? "Ativo"
                        : "Inativo"}
                    </Badge>
                  </TableCell>

                  {/* AÇÕES */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <Link
                        href={`/admin/banners/${banner.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

            {banners.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  Nenhum banner cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}