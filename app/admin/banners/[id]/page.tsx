"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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

export default function EditBannerPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [link, setLink] = useState("")
  const [order, setOrder] = useState("")
  const [active, setActive] = useState(true)
  const [categoryId, setCategoryId] = useState("") // Adicionado
  const [categories, setCategories] = useState<Category[]>([]) // Adicionado

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [bannerRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/banners/${id}`),
          fetch("/api/admin/categories")
        ])

        if (!bannerRes.ok) throw new Error()
        
        const bannerData = await bannerRes.json()
        const categoriesData = await categoriesRes.json()

        setTitle(bannerData.title)
        setImage(bannerData.image)
        setLink(bannerData.link || "")
        setOrder(String(bannerData.order ?? 0))
        setActive(bannerData.active)
        setCategoryId(bannerData.categoryId || "")
        setCategories(categoriesData.filter((c: Category) => c.active))
      } catch (err) {
        alert("Erro ao carregar dados")
        router.push("/admin/banners")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, router])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      let imageUrl = image

      if (file) {
        const formData = new FormData()
        formData.append("file", file)
        const upload = await fetch("/api/upload/banner", { // Ajustado para sua rota de banner
          method: "POST",
          body: formData,
        })
        if (!upload.ok) throw new Error("Erro upload")
        const data = await upload.json()
        imageUrl = data.url
      }

      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          image: imageUrl,
          link,
          categoryId: categoryId || null,
          order: Number(order) || 0,
          active,
        }),
      })

      if (!res.ok) throw new Error()
      router.push("/admin/banners")
      router.refresh()
    } catch {
      alert("Erro ao atualizar banner")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Deseja deletar este banner?")) return
    try {
      await fetch(`/api/admin/banners/${id}`, { method: "DELETE" })
      router.push("/admin/banners")
      router.refresh()
    } catch {
      alert("Erro ao deletar")
    }
  }

  if (loading) return <div className="p-10 text-center">Carregando banner...</div>

  return (
    <form onSubmit={handleUpdate} className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Editar banner</h1>
        <Button type="button" variant="outline" onClick={() => router.back()}>Voltar</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Conteúdo Visual</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Título Interno</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Banner Verão 2024" />
              </div>

              <div>
                <Label>Link de Destino (URL ou /categoria)</Label>
                <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Ex: /camisetas ou https://..." />
              </div>

              <div>
                <Label>Categoria Vinculada</Label>
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Nenhuma (Banner Geral)</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagem do Banner</Label>
              {(preview || image) && (
                <div className="relative h-48 w-full overflow-hidden rounded-md border bg-slate-100">
                  <Image
                    src={preview || image!}
                    alt="Banner Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setFile(f)
                  setPreview(URL.createObjectURL(f))
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label>Ordem de Exibição</Label>
              <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Banner Ativo</Label>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="destructive" type="button" onClick={handleDelete}>Deletar Banner</Button>
        <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar Alterações"}</Button>
      </div>
    </form>
  )
}