"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/banners/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => {
        setTitle(data.title)
        setImage(data.image) // ✅ image
        setLink(data.link || "")
        setOrder(String(data.order ?? 0))
        setActive(data.active)
      })
      .catch(() => alert("Erro ao carregar banner"))
      .finally(() => setLoading(false))
  }, [id])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      let imageUrl = image

      // 🔹 se trocou a imagem, faz upload
      if (file) {
        const formData = new FormData()
        formData.append("file", file)

        const upload = await fetch("/api/upload", {
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
          image: imageUrl, // ✅ image
          link,
          order: Number(order) || 0,
          active,
        }),
      })

      if (!res.ok) throw new Error()

      router.push("/admin/banners")
    } catch {
      alert("Erro ao atualizar banner")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Deseja deletar este banner?")) return

    await fetch(`/api/admin/banners/${id}`, {
      method: "DELETE",
    })

    router.push("/admin/banners")
  }

  if (loading) return <p>Carregando...</p>

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <h1 className="text-3xl font-bold">Editar banner</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <Label>Imagem atual</Label>

            {(preview || image) && (
              <div className="relative h-40 w-full overflow-hidden rounded-md border">
                <Image
                  src={preview || image!}
                  alt={title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            )}

            <Input
              type="file"
              accept="image/*"
              className="mt-2"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setFile(f)
                setPreview(URL.createObjectURL(f))
              }}
            />
          </div>

          <div>
            <Label>Link</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} />
          </div>

          <div className="max-w-xs">
            <Label>Ordem</Label>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </div>

          <div className="flex justify-between">
            <Label>Ativo</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>

        <Button
          variant="destructive"
          type="button"
          onClick={handleDelete}
        >
          Deletar
        </Button>
      </div>
    </form>
  )
}
