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
import { X, Plus, Trash2 } from "lucide-react"

type Category = {
  id: string
  name: string
  active: boolean
}

type Variation = {
  tempId: number
  id?: string // ID real do banco (opcional para novas variações)
  size: string
  color: string
  stock: number
  sku: string
  priceDiff: number
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Estados do Produto
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [active, setActive] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [bestSeller, setBestSeller] = useState(false)

  // Imagens
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  // Relacionamentos e Dimensões
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [variations, setVariations] = useState<Variation[]>([])
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [width, setWidth] = useState("")
  const [length, setLength] = useState("")

  // 1️⃣ Carregar Produto e Categorias
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch("/api/admin/categories")
        ])

        if (!prodRes.ok) throw new Error("Produto não encontrado")
        const p = await prodRes.json()
        const cats = await catRes.json()

        setCategories(cats.filter((c: Category) => c.active))

        // Preencher estados
        setName(p.name || "")
        setSlug(p.slug || "")
        setPrice(String(p.price || ""))
        setDescription(p.description || "")
        setActive(!!p.active)
        setFeatured(!!p.featured)
        setBestSeller(!!p.bestSeller)
        setExistingImages(p.images || [])
        setCategoryId(p.categoryId || null)
        setWeight(p.weight ? String(p.weight) : "")
        setHeight(p.height ? String(p.height) : "")
        setWidth(p.width ? String(p.width) : "")
        setLength(p.length ? String(p.length) : "")

        setVariations(
          (p.variations || []).map((v: any) => ({
            tempId: Math.random(),
            id: v.id,
            size: v.size || "",
            color: v.color || "",
            stock: v.stock || 0,
            sku: v.sku || "",
            priceDiff: v.priceDiff || 0,
          }))
        )
      } catch (err) {
        console.error(err)
        router.push("/admin/produtos")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, router])

  // 2️⃣ Helpers de Imagem
  function handleNewImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files
    if (!files) return
    setNewImageFiles((prev) => [...prev, ...Array.from(files)])
  }

  function removeExistingImage(url: string) {
    setExistingImages((prev) => prev.filter((img) => img !== url))
  }

  function removeNewImage(index: number) {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // 3️⃣ Helpers de Variação
  function addVariation() {
    setVariations((prev) => [
      ...prev,
      { tempId: Date.now(), size: "", color: "", stock: 0, sku: "", priceDiff: 0 },
    ])
  }

  function updateVariation<T extends keyof Variation>(tempId: number, field: T, value: Variation[T]) {
    setVariations((prev) => prev.map((v) => (v.tempId === tempId ? { ...v, [field]: value } : v)))
  }

  // 4️⃣ Salvar Alterações
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      let finalImages = [...existingImages]

      // Se houver novas imagens, faz upload para o Cloudinary primeiro
      if (newImageFiles.length > 0) {
        const formData = new FormData()
        newImageFiles.forEach((file) => formData.append("files", file))
        
        const uploadRes = await fetch("/api/upload/product", {
          method: "POST",
          body: formData,
        })
        
        if (!uploadRes.ok) throw new Error("Erro no upload de novas imagens")
        const { urls } = await uploadRes.json()
        finalImages = [...finalImages, ...urls]
      }

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
          images: finalImages,
          categoryId,
          weight: weight ? Number(weight) : null,
          height: height ? Number(height) : null,
          width: width ? Number(width) : null,
          length: length ? Number(length) : null,
          variations: variations.map(({ tempId, ...rest }) => ({
            ...rest,
            stock: Number(rest.stock),
            priceDiff: Number(rest.priceDiff),
          })),
        }),
      })

      if (!res.ok) throw new Error("Erro ao atualizar produto")
      
      router.push("/admin/produtos")
      router.refresh()
    } catch (err) {
      alert("Erro ao salvar alterações")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-10 text-center">Carregando dados do produto...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto pb-20 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Editar: {name}</h1>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar Alterações"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <Card>
            <CardHeader><CardTitle>Informações Principais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Nome" value={name} onChange={(e) => {setName(e.target.value); setSlug(makeProductSlug(e.target.value))}} />
              <Input placeholder="Slug" value={slug} onChange={(e) => setSlug(makeProductSlug(e.target.value))} />
              <Textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              <Input type="number" placeholder="Preço" value={price} onChange={(e) => setPrice(e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Gerenciar Imagens</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Label>Novas Imagens</Label>
              <Input type="file" multiple accept="image/*" onChange={handleNewImageUpload} />
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Imagens que já estão no Cloudinary */}
                {existingImages.map((url, i) => (
                  <div key={url} className="relative aspect-square border rounded-lg overflow-hidden group">
                    <img src={url} className="object-cover w-full h-full" alt="Produto" />
                    <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"><X size={14}/></button>
                    <div className="absolute bottom-0 left-0 bg-black/50 text-[10px] text-white px-1">Existente</div>
                  </div>
                ))}
                {/* Previews das novas imagens selecionadas */}
                {newImageFiles.map((file, i) => (
                  <div key={i} className="relative aspect-square border-2 border-dashed border-primary rounded-lg overflow-hidden group">
                    <img src={URL.createObjectURL(file)} className="object-cover w-full h-full opacity-70" alt="Novo" />
                    <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"><X size={14}/></button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Variações</CardTitle>
              <Button type="button" size="sm" onClick={addVariation}><Plus size={16} className="mr-1"/> Add</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {variations.map((v) => (
                <div key={v.tempId} className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 border rounded-lg bg-slate-50">
                  <Input placeholder="Tam" value={v.size} onChange={(e) => updateVariation(v.tempId, "size", e.target.value)} />
                  <Input placeholder="Cor" value={v.color} onChange={(e) => updateVariation(v.tempId, "color", e.target.value)} />
                  <Input placeholder="SKU" value={v.sku} onChange={(e) => updateVariation(v.tempId, "sku", e.target.value)} />
                  <Input type="number" placeholder="Estoque" value={v.stock} onChange={(e) => updateVariation(v.tempId, "stock", Number(e.target.value))} />
                  <Button type="button" variant="ghost" onClick={() => setVariations(prev => prev.filter(item => item.tempId !== v.tempId))}><Trash2 size={16} className="text-red-500"/></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Categoria</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="category" checked={categoryId === c.id} onChange={() => setCategoryId(c.id)} className="accent-black" />
                  <span className="text-sm">{c.name}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Dimensões de Frete</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><Label className="text-xs">Peso (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Altura (cm)</Label><Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Largura (cm)</Label><Input type="number" value={width} onChange={(e) => setWidth(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Comprimento (cm)</Label><Input type="number" value={length} onChange={(e) => setLength(e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Visibilidade</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center"><Label>Ativo</Label><Switch checked={active} onCheckedChange={setActive} /></div>
              <div className="flex justify-between items-center"><Label>Destaque</Label><Switch checked={featured} onCheckedChange={setFeatured} /></div>
              <div className="flex justify-between items-center"><Label>Mais Vendido</Label><Switch checked={bestSeller} onCheckedChange={setBestSeller} /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}