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
import { X, Plus, Trash2 } from "lucide-react"

type Category = {
  id: string
  name: string
  active: boolean
}

// Interface estendida para incluir um ID temporário de controle no front-end
type Variation = {
  tempId: number // Vital para o React não bugar no delete
  size: string
  color: string
  stock: number
  sku: string
  priceDiff: number
  weight?: number
  height?: number
  width?: number
  length?: number
}

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estados do Produto
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [active, setActive] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [bestSeller, setBestSeller] = useState(false)

  // Estados de Relacionamento
  const [images, setImages] = useState<File[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<string | null>(null)
  
  // Variações
  const [variations, setVariations] = useState<Variation[]>([])

  // Carregar Categorias
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories")
        const data = await res.json()
        setCategories(data.filter((c: Category) => c.active))
      } catch (err) {
        console.error("Erro ao carregar categorias")
      }
    }
    loadCategories()
  }, [])

  // Gerenciamento de Imagens
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files
    if (!files) return
    setImages((prev) => [...prev, ...Array.from(files)])
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Gerenciamento de Variações (CORRIGIDO)
  function addVariation() {
    setVariations((prev) => [
      ...prev,
      { 
        tempId: Date.now(), // ID único baseado no tempo
        size: "", 
        color: "", 
        sku: "", 
        stock: 0, 
        priceDiff: 0 
      },
    ])
  }

  function updateVariation<T extends keyof Variation>(
    tempId: number,
    field: T,
    value: Variation[T]
  ) {
    setVariations((prev) =>
      prev.map((v) => (v.tempId === tempId ? { ...v, [field]: value } : v))
    )
  }

  function removeVariation(tempId: number) {
    setVariations((prev) => prev.filter((v) => v.tempId !== tempId))
  }

  // Submit Final
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return

    if (!name || !price || !categoryId) {
      alert("Preencha nome, preço e categoria")
      return
    }

    if (images.length === 0) {
      alert("Adicione pelo menos uma imagem")
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Upload Cloudinary
      const formData = new FormData()
      images.forEach((file) => formData.append("files", file))

      const uploadRes = await fetch("/api/upload/product", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) throw new Error("Erro no upload das imagens")
      const { urls } = await uploadRes.json()

      // 2. Salvar no Banco
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
          images: urls,
          categoryId,
          variations: variations.map(({ tempId, ...rest }) => ({
            ...rest,
            stock: Number(rest.stock),
            priceDiff: Number(rest.priceDiff)
          })),
        }),
      })

      if (!res.ok) throw new Error("Erro ao salvar o produto")

      router.push("/admin/produtos")
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto pb-20 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Produto</h1>
          <p className="text-muted-foreground">Cadastre as informações e variações do item.</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Produto"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: INFO E VARIAÇÕES */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* INFO BÁSICA */}
          <Card>
            <CardHeader><CardTitle>Geral</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input
                  id="name"
                  placeholder="Ex: Camiseta de Algodão Premium"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setSlug(makeProductSlug(e.target.value))
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug (URL amigável)</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(makeProductSlug(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2 w-full md:w-1/3">
                <Label htmlFor="price">Preço Base (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* IMAGENS */}
          <Card>
            <CardHeader><CardTitle>Imagens do Produto</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input type="file" multiple accept="image/*" onChange={handleImageUpload} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square border-2 rounded-lg overflow-hidden group">
                    <img 
                      src={URL.createObjectURL(img)} 
                      alt="Preview" 
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* VARIAÇÕES */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Variações e Estoque</CardTitle>
              <Button type="button" size="sm" onClick={addVariation} className="gap-2">
                <Plus size={16} /> Add Variação
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {variations.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                  Nenhuma variação adicionada. Use variações para cores e tamanhos.
                </div>
              )}
              {variations.map((v) => (
                <div key={v.tempId} className="p-4 border rounded-xl bg-slate-50/50 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Tamanho</Label>
                      <Input value={v.size} onChange={(e) => updateVariation(v.tempId, "size", e.target.value)} placeholder="P, M, G..." />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cor</Label>
                      <Input value={v.color} onChange={(e) => updateVariation(v.tempId, "color", e.target.value)} placeholder="Azul, Verde..." />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">SKU</Label>
                      <Input value={v.sku} onChange={(e) => updateVariation(v.tempId, "sku", e.target.value)} placeholder="SKU-001" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Estoque</Label>
                      <Input type="number" value={v.stock} onChange={(e) => updateVariation(v.tempId, "stock", Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Dif. Preço</Label>
                      <Input type="number" step="0.01" value={v.priceDiff} onChange={(e) => updateVariation(v.tempId, "priceDiff", Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="flex justify-end border-t pt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeVariation(v.tempId)} 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} className="mr-2" /> Remover
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: CATEGORIA E FLAGS */}
        <div className="space-y-8">
          
          <Card>
            <CardHeader><CardTitle>Categoria</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {categories.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma categoria ativa encontrada.</p>}
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-3 p-2 border rounded-md hover:bg-slate-50 cursor-pointer transition">
                  <input
                    type="radio"
                    name="category"
                    checked={categoryId === c.id}
                    onChange={() => setCategoryId(c.id)}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-sm font-medium">{c.name}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Status e Visibilidade</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <Label>Ativo</Label>
                  <p className="text-xs text-muted-foreground">Disponível na loja</p>
                </div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <Label>Destaque</Label>
                  <p className="text-xs text-muted-foreground">Página inicial</p>
                </div>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <Label>Mais Vendido</Label>
                  <p className="text-xs text-muted-foreground">Badge de popular</p>
                </div>
                <Switch checked={bestSeller} onCheckedChange={setBestSeller} />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </form>
  )
}