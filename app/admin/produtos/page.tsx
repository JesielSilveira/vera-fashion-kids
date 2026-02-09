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
import { DeleteProductButton } from "@/app/admin/DeleteProductButton"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos da loja
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo produto
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Destaque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  {product.name}
                </TableCell>

                <TableCell>
                  R$ {product.price.toFixed(2)}
                </TableCell>

                <TableCell>
                  <Badge variant={product.active ? "default" : "secondary"}>
                    {product.active ? "ativo" : "inativo"}
                  </Badge>
                </TableCell>

                <TableCell>
                  {product.featured ? "Sim" : "Não"}
                </TableCell>

                <TableCell className="text-right flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/produtos/${product.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>

                  <DeleteProductButton id={product.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
