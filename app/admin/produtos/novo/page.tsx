"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { makeProductSlug } from "@/lib/slugify"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Category = {
  id: string
  name: string
  slug: string
  active: boolean
}

type Variation = {
  size: string
  color: string
  stock: number
  sku: string
  imageIndex?: number
  priceDiff?: number
  weight?: number
  height?: number
  width?: number
  length?: number
}

export default function NewProductPage() {
  const router = useRouter()

  // =========================
  // BÁSICO
  // =========================
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")

  // =========================
  // FLAGS
  // =========================
  const [active, setActive] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [bestSeller, setBestSeller] = useState(false)

  // =========================
  // RELACIONAMENTOS
  // =========================
  const [images, setImages] = useState<File[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<string | null>(null)

  // =========================
  // VARIAÇÕES
  // =========================
  const [variations, setVariations] = useState<Variation[]>([])

  // =========================
  // LOAD CATEGORIES
  // =========================
  useEffect(() => {
    async function loadCategories() {
      const res = await fetch("/api/admin/categories")
      const data = await res.json()
      setCategories(data.filter((c: Category) => c.active))
    }
    loadCategories()
  }, [])

  // =========================
  // HELPERS
  // =========================
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files
    if (!files) return
    setImages((prev) => [...prev, ...Array.from(files)])
  }

  function addVariation() {
    setVariations((prev) => [
      ...prev,
      {
        size: "",
        color: "",
        sku: "",
        stock: 0,
        priceDiff: 0,
      },
    ])
  }

  function updateVariation<T extends keyof Variation>(
    index: number,
    field: T,
    value: Variation[T]
  ) {
    setVariations((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    )
  }

  function removeVariation(index: number) {
    setVariations((prev) => prev.filter((_, i) => i !== index))
  }

  // =========================
  // SUBMIT
  // =========================
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  if (!name || !price || !categoryId) {
    alert("Preencha nome, preço e categoria")
    return
  }

  if (images.length === 0) {
    alert("Adicione ao menos uma imagem")
    return
  }

  try {
    // 1️⃣ Upload das imagens no Cloudinary
    const formData = new FormData()
    images.forEach((file) => formData.append("files", file))

    const uploadRes = await fetch("/api/upload/product", {
      method: "POST",
      body: formData,
    })

    const uploadText = await uploadRes.text()
    if (!uploadRes.ok) throw new Error(uploadText)

    const uploadData = JSON.parse(uploadText)

    if (!Array.isArray(uploadData.urls)) {
      throw new Error("Upload não retornou URLs")
    }

    // 2️⃣ Sanitiza variações
    const safeVariations = variations.map((v) => ({
      ...v,
      stock: Number(v.stock) || 0,
      priceDiff: Number(v.priceDiff) || 0,
      imageIndex:
        typeof v.imageIndex === "number" ? v.imageIndex : undefined,
    }))

    // 3️⃣ Cria produto no banco
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: slug || makeProductSlug(name),
        price: Number(price),
        description,
        active,
        featured,
        bestSeller,
        images: uploadData.urls, // ✅ URLs Cloudinary
        categoryId,
        variations: safeVariations,
      }),
    })

    if (!res.ok) throw new Error("Erro ao salvar produto")

    router.push("/admin/produtos")
    router.refresh()
  } catch (err) {
    console.error(err)
    alert("Erro ao salvar produto")
  }
}


  // =========================
  // UI
  // =========================
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo produto</h1>
        <p className="text-muted-foreground">Cadastro de novo item</p>
      </div>

      {/* INFO BÁSICA */}
      <Card>
        <CardHeader>
          <CardTitle>Informações básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Nome"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSlug(makeProductSlug(e.target.value))
            }}
          />
          <Input
            placeholder="Slug"
            value={slug}
            onChange={(e) => setSlug(makeProductSlug(e.target.value))}
          />
          <Textarea
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full max-w-full resize-y overflow-x-hidden whitespace-pre-wrap break-all"
          />
          <Input
            type="number"
            placeholder="Preço base"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* IMAGENS */}
      <Card>
        <CardHeader>
          <CardTitle>Imagens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
          />
          <div className="flex gap-2 flex-wrap">
            {images.map((img, i) => (
              <Badge key={i}>{img.name}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CATEGORIA */}
      <Card>
        <CardHeader>
          <CardTitle>Categoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((c) => (
            <label key={c.id} className="flex gap-2 items-center">
              <input
                type="radio"
                checked={categoryId === c.id}
                onChange={() => setCategoryId(c.id)}
              />
              {c.name}
            </label>
          ))}
        </CardContent>
      </Card>

      {/* VARIAÇÕES */}
      <Card>
        <CardHeader>
          <CardTitle>Variações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {variations.map((v, i) => (
            <div key={i} className="grid md:grid-cols-10 gap-2 border p-3 rounded">
              <Input
                placeholder="Tamanho"
                value={v.size}
                onChange={(e) => updateVariation(i, "size", e.target.value)}
              />
              <Input
                placeholder="Cor"
                value={v.color}
                onChange={(e) => updateVariation(i, "color", e.target.value)}
              />
              <Input
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariation(i, "sku", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Estoque"
                value={v.stock}
                onChange={(e) => updateVariation(i, "stock", Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Dif. preço"
                value={v.priceDiff}
                onChange={(e) => updateVariation(i, "priceDiff", Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Peso (kg)"
                value={v.weight ?? ""}
                onChange={(e) => updateVariation(i, "weight", Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Altura (cm)"
                value={v.height ?? ""}
                onChange={(e) => updateVariation(i, "height", Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Largura (cm)"
                value={v.width ?? ""}
                onChange={(e) => updateVariation(i, "width", Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Comprimento (cm)"
                value={v.length ?? ""}
                onChange={(e) => updateVariation(i, "length", Number(e.target.value))}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeVariation(i)}
              >
                Remover
              </Button>
            </div>
          ))}
          <Button type="button" onClick={addVariation}>
            Adicionar variação
          </Button>
        </CardContent>
      </Card>

      {/* FLAGS */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <Label>Ativo</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
          <div className="flex justify-between">
            <Label>Destaque</Label>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </div>
          <div className="flex justify-between">
            <Label>Mais vendido</Label>
            <Switch checked={bestSeller} onCheckedChange={setBestSeller} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit">Salvar produto</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
