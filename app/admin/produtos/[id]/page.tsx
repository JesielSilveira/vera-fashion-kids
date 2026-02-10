"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
  priceDiff?: number
  imageIndex?: number
  weight?: number
  height?: number
  width?: number
  length?: number
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<string | null>(null)

  // =========================
  // VARIAÇÕES
  // =========================
  const [variations, setVariations] = useState<Variation[]>([])

  // =========================
  // DIMENSÕES
  // =========================
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [width, setWidth] = useState("")
  const [length, setLength] = useState("")

  // =========================
  // LOAD PRODUTO
  // =========================
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/admin/products/${id}`)
        if (!res.ok) throw new Error("Erro ao carregar produto")
        const p = await res.json()

        setName(p.name ?? "")
        setSlug(p.slug ?? "")
        setPrice(String(p.price ?? ""))
        setDescription(p.description ?? "")

        setActive(!!p.active)
        setFeatured(!!p.featured)
        setBestSeller(!!p.bestSeller)

        setExistingImages(p.images ?? [])
        setCategoryId(p.categoryId ?? null)

        setVariations(
          (p.variations ?? []).map((v: any) => ({
            size: v.size ?? "",
            color: v.color ?? "",
            stock: v.stock ?? 0,
            sku: v.sku ?? "",
            priceDiff: v.priceDiff ?? 0,
            imageIndex: v.imageIndex,
            weight: v.weight,
            height: v.height,
            width: v.width,
            length: v.length,
          }))
        )

        setWeight(p.weight ?? "")
        setHeight(p.height ?? "")
        setWidth(p.width ?? "")
        setLength(p.length ?? "")
      } catch (err) {
        console.error(err)
        alert("Erro ao carregar produto")
        router.push("/admin/produtos")
      } finally {
        setLoading(false)
      }
    }

    if (id) loadProduct()
  }, [id, router])

  // =========================
  // LOAD CATEGORIAS
  // =========================
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories")
        const data = await res.json()
        setCategories(data.filter((c: Category) => c.active))
      } catch (err) {
        console.error("Erro ao carregar categorias", err)
      }
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
      { size: "", color: "", stock: 0, sku: "", priceDiff: 0 },
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
  // SAVE
  // =========================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      // 📌 converte novas imagens para base64
      const uploadedImages: string[] = []
      for (const file of images) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        uploadedImages.push(base64)
      }

      const allImages = [...existingImages, ...uploadedImages]

      // sanitiza variações
      const safeVariations = variations.map((v) => ({
        ...v,
        stock: Number(v.stock) || 0,
        priceDiff: Number(v.priceDiff) || 0,
        imageIndex: typeof v.imageIndex === "number" ? v.imageIndex : undefined,
        weight: v.weight ? Number(v.weight) : undefined,
        height: v.height ? Number(v.height) : undefined,
        width: v.width ? Number(v.width) : undefined,
        length: v.length ? Number(v.length) : undefined,
      }))

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || makeProductSlug(name),
          price: Number(price),
          description,
          active,
          featured,
          bestSeller,
          images: allImages, // 📌 base64 direto no banco
          categoryId,
          weight: weight ? Number(weight) : null,
          height: height ? Number(height) : null,
          width: width ? Number(width) : null,
          length: length ? Number(length) : null,
          variations: safeVariations,
        }),
      })

      if (!res.ok) throw new Error()
      router.push("/admin/produtos")
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Erro ao salvar produto")
    } finally {
      setSaving(false)
    }
  }

  // =========================
  // UI
  // =========================
  if (loading) return <p className="text-muted-foreground">Carregando...</p>

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-3xl font-bold">Editar produto</h1>

      {/* BÁSICO */}
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
        <CardHeader><CardTitle>Imagens</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input type="file" multiple accept="image/*" onChange={handleImageUpload} />
          <div className="flex gap-2 flex-wrap">
            {existingImages.map((img, i) => <Badge key={i}>{img}</Badge>)}
            {images.map((file, i) => <Badge key={i + existingImages.length}>{file.name}</Badge>)}
          </div>
        </CardContent>
      </Card>

      {/* CATEGORIA */}
      <Card>
        <CardHeader><CardTitle>Categoria</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Variações</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {variations.map((v, i) => (
            <div key={i} className="grid md:grid-cols-6 gap-2 border p-3 rounded">
              <Input placeholder="Tamanho" value={v.size} onChange={(e) => updateVariation(i, "size", e.target.value)} />
              <Input placeholder="Cor" value={v.color} onChange={(e) => updateVariation(i, "color", e.target.value)} />
              <Input placeholder="SKU" value={v.sku} onChange={(e) => updateVariation(i, "sku", e.target.value)} />
              <Input type="number" placeholder="Estoque" value={v.stock} onChange={(e) => updateVariation(i, "stock", Number(e.target.value))} />
              <Input type="number" placeholder="Dif. preço" value={v.priceDiff} onChange={(e) => updateVariation(i, "priceDiff", Number(e.target.value))} />
              <Button type="button" variant="destructive" onClick={() => removeVariation(i)}>Remover</Button>
            </div>
          ))}
          <Button type="button" onClick={addVariation}>Adicionar variação</Button>
        </CardContent>
      </Card>

      {/* DIMENSÕES */}
      <Card>
        <CardHeader><CardTitle>Dimensões</CardTitle></CardHeader>
        <CardContent className="space-y-2 grid md:grid-cols-2 gap-4">
          <Input placeholder="Peso (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <Input placeholder="Altura (cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
          <Input placeholder="Largura (cm)" type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
          <Input placeholder="Comprimento (cm)" type="number" value={length} onChange={(e) => setLength(e.target.value)} />
        </CardContent>
      </Card>

      {/* FLAGS */}
      <Card>
        <CardHeader><CardTitle>Configurações</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between"><Label>Ativo</Label><Switch checked={active} onCheckedChange={setActive} /></div>
          <div className="flex justify-between"><Label>Destaque</Label><Switch checked={featured} onCheckedChange={setFeatured} /></div>
          <div className="flex justify-between"><Label>Mais vendido</Label><Switch checked={bestSeller} onCheckedChange={setBestSeller} /></div>
        </CardContent>
      </Card>

      {/* AÇÕES */}
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  )
}
