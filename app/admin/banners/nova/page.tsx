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
  const [file, setFile] = useState<File | null>(null)
  const [link, setLink] = useState("")
  const [order, setOrder] = useState(0)
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => Array.isArray(data) && setCategories(data.filter((c: Category) => c.active)))
      .catch(console.error)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title || !file || !selectedCategory) {
      return alert("Preencha todos os campos obrigatórios")
    }

    setLoading(true)
    try {
      // 1️⃣ Upload no Cloudinary
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload/banner", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error)

      // 2️⃣ Criar banner
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          image: uploadData.url, // ✅ URL do Cloudinary
          link: link.trim() || null,
          categoryId: selectedCategory,
          order,
          active,
        }),
      })

      if (!res.ok) throw new Error("Erro ao criar banner")

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
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div>
              <Label>Imagem</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label>Categoria</Label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full h-10 rounded-md border px-3"
              >
                <option value="">Selecione…</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ordem</Label>
                <Input type="number" value={order} onChange={e => setOrder(+e.target.value || 0)} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Ativo</Label>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Banner"}
        </Button>
      </form>
    </div>
  )
}
