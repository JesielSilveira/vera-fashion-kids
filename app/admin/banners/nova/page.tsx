"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Category {
  id: string
  name: string
  active: boolean
}

export default function NewBannerPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [link, setLink] = useState("")
  const [order, setOrder] = useState(0)
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/admin/categories")
        if (!res.ok) throw new Error("Falha ao buscar categorias")
        const data = await res.json()
        if (Array.isArray(data)) {
          setCategories(data.filter((c: Category) => c.active))
        }
      } catch (err) {
        console.error("Erro categorias:", err)
      }
    }
    fetchCategories()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim() || !imageUrl.trim() || !selectedCategory) {
      return alert("Preencha todos os campos obrigatórios!")
    }

    if (!imageUrl.startsWith("http")) {
      return alert("A imagem precisa ser uma URL válida (Cloudinary).")
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          image: imageUrl.trim(),
          link: link.trim() || null,
          categoryId: selectedCategory,
          order: Number(order) || 0,
          active,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || "Erro ao criar banner")
      }

      router.push("/admin/banners")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Novo Banner</h1>

        <Card>
          <CardHeader>
            <CardTitle>Configurações do Banner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título do Banner</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Coleção Outono 2024"
                required
              />
            </div>

            <div>
              <Label htmlFor="image">URL da Imagem (Cloudinary)</Label>
              <Input
                id="image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                required
              />
            </div>

            <div>
              <Label htmlFor="link">Link do Banner (opcional)</Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/categoria/promocoes"
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 rounded-md border px-3 text-sm"
                required
              >
                <option value="">Selecione uma categoria...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Ordem</Label>
                <Input
                  id="order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value) || 0)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Banner Ativo?</Label>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Banner"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
