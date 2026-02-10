"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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

type Category = {
  id: string
  name: string
  slug: string
  active: boolean
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingIds, setLoadingIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // =========================
  // Busca categorias do servidor
  // =========================
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories")
        if (!res.ok) throw new Error("Erro ao carregar categorias")
        const data: Category[] = await res.json()
        setCategories(data ?? [])
      } catch (err) {
        console.error(err)
        alert("Erro ao carregar categorias")
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  // =========================
  // DELETE categoria
  // =========================
  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir esta categoria?")) return
    setLoadingIds((prev) => [...prev, id])

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao deletar categoria")
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err: any) {
      alert(err.message || "Erro desconhecido")
    } finally {
      setLoadingIds((prev) => prev.filter((i) => i !== id))
    }
  }

  if (loading) return <p>Carregando categorias...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">Gerencie as categorias da loja</p>
        </div>
        <Button asChild>
          <Link href="/admin/categorias/nova">Nova Categoria</Link>
        </Button>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.slug}</TableCell>
                <TableCell>
                  <Badge variant={cat.active ? "default" : "secondary"}>
                    {cat.active ? "Ativa" : "Inativa"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/categorias/${cat.id}`}>✏️</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(cat.id)}
                    disabled={loadingIds.includes(cat.id)}
                  >
                    🗑️
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
