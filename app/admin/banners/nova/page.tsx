"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Category = {
  id: string
  name: string
  active: boolean
}

export default function NewBannerPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [order, setOrder] = useState(0)
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")

  // =========================
  // CARREGA CATEGORIAS ATIVAS
  // =========================
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/admin/categories")
        if (!res.ok) throw new Error("Falha ao buscar categorias")

        const data: Category[] = await res.json()
        // filtra só categorias ativas
        const activeCategories = data.filter(c => c.active)
        setCategories(activeCategories)
      } catch (err) {
        console.error(err)
        alert("Erro ao carregar categorias")
      }
    }
    fetchCategories()
  }, [])

  // =========================
  // LIMPA PREVIEW AO DESCARTE
  // =========================
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  // =========================
  // SUBMIT
  // =========================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !file || !selectedCategory) return alert("Preencha todos os campos")

    setLoading(true)
    try {
      // Upload da imagem
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()
      if (!uploadData.url) throw new Error("Falha no upload da imagem")

      // Criar banner
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          image: uploadData.url,
          categoryId: selectedCategory,
          order,
          active,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        console.error(err)
        throw new Error("Erro ao criar banner")
      }

      router.push("/admin/banners")
    } catch (err) {
      console.error(err)
      alert("Erro ao criar banner")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-3xl font-bold">Novo banner</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <Label>Imagem</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setFile(f)
                setPreview(URL.createObjectURL(f))
              }}
              required
            />
            {preview && (
              <div className="relative mt-3 h-40 w-full overflow-hidden rounded-md border">
                <Image src={preview} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>

          <div>
            <Label>Categoria</Label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="max-w-xs">
            <Label>Ordem</Label>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value) || 0)}
            />
          </div>

          <div className="flex justify-between items-center">
            <Label>Ativo</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar banner"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
