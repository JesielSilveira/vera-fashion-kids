"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { makeProductSlug } from "@/lib/slugify"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewCategoryPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [active, setActive] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name || !file) {
      return alert("Nome e imagem são obrigatórios")
    }

    setLoading(true)

    try {
      // 1️⃣ Upload no Cloudinary
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload/category", {
        method: "POST",
        body: formData,
      })

      const uploadText = await uploadRes.text()
      if (!uploadRes.ok) throw new Error(uploadText)

      const uploadData = JSON.parse(uploadText)

      // 2️⃣ Criar categoria
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug || makeProductSlug(name),
          active,
          image: uploadData.url, // ✅ URL do Cloudinary
        }),
      })

      if (!res.ok) throw new Error("Erro ao criar categoria")

      router.push("/admin/categorias")
    } catch (err: any) {
      alert(err.message || "Erro inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova categoria</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSlug(makeProductSlug(e.target.value))
              }}
              required
            />
          </div>

          <div>
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>

          <div>
            <Label>Imagem</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && (
              <img
                src={preview}
                className="mt-2 h-40 w-40 object-cover rounded-lg border"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label>Ativa</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </CardContent>
      </Card>

      <Button disabled={loading}>
        {loading ? "Salvando..." : "Salvar categoria"}
      </Button>
    </form>
  )
}
