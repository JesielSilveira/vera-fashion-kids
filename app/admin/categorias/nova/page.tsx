"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { makeProductSlug } from "@/lib/slugify"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function NewCategoryPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [active, setActive] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)

    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      setLoading(true)

      try {
        const formData = new FormData()
        formData.append("name", name.trim())
        formData.append("slug", slug.trim() || makeProductSlug(name))
        formData.append("active", String(active))
        if (imageFile) formData.append("file", imageFile) // ⚠ 'file' aqui é o mesmo que na API

        const res = await fetch("/api/admin/categories", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) throw new Error("Erro ao criar categoria")

        router.push("/admin/categorias")
      } catch (err: any) {
        console.error(err)
        alert(err.message || "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nova categoria</h1>
        <p className="text-muted-foreground">
          Cadastre uma nova categoria de produtos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da categoria</CardTitle>
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
              placeholder="Ex: Calçados"
              required
            />
          </div>

          <div>
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="calcados"
              required
            />
          </div>

          <div>
            <Label>Imagem da categoria</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="mt-2 h-40 w-40 object-cover rounded-lg border"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label>Categoria ativa</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar categoria"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
