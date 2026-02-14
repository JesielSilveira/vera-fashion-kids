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
import { X, Plus, Trash2, Banknote } from "lucide-react"

type Category = {
  id: string
  name: string
  active: boolean
}

type Variation = {
  tempId: number
  id?: string 
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

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [active, setActive] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [bestSeller, setBestSeller] = useState(false)

  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [variations, setVariations] = useState<Variation[]>([])
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [width, setWidth] = useState("")
  const [length, setLength] = useState("")

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

  function addVariation() {
    setVariations((prev) => [
      ...prev,
      { tempId: Date.now(), size: "", color: "", stock: 0, sku: "", priceDiff: 0 },
    ])
  }

  function updateVariation<T extends keyof Variation>(tempId: number, field: T, value: Variation[T]) {
    setVariations((prev) => prev.map((v) => (v.tempId === tempId ? { ...v, [field]: value } : v)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      let finalImages = [...existingImages]

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

  if (loading) return <div className="p-10 text-center animate-pulse">Carregando dados do produto...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto pb-20 p-4 overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Editar: {name}</h1>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving} className="bg-black hover:bg-zinc-800">
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8 min-w-0">
          
          <Card className="border-2 shadow-sm">
            <CardHeader><CardTitle className="text-lg">Informações Principais</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label className="font-bold">Nome do Produto</Label>
                <Input value={name} onChange={(e) => {setName(e.target.value); setSlug(makeProductSlug(e.target.value))}} className="h-12" />
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold text-gray-400">Link do Produto (Slug)</Label>
                <div className="p-3 bg-slate-50 border rounded-md text-sm text-zinc-500 break-all font-mono">
                  {slug || "Gerando link..."}
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="font-bold">Descrição (Respeita parágrafos)</Label>
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={8} 
                  className="min-h-[200px] leading-relaxed resize-y whitespace-pre-wrap"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label className="font-bold">Preço Base (Cartão)</Label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="h-12 text-lg font-semibold" />
                </div>
                <div className="flex flex-col justify-center p-4 bg-green-50 border border-green-200 rounded-xl">
                   <div className="flex items-center gap-2 text-green-700 font-bold text-xs mb-1 uppercase">
                     <Banknote size={16} /> Preço no PIX (-9%)
                   </div>
                   <p className="text-2xl font-black text-green-600">
                     {price ? `R$ ${(Number(price) * 0.91).toFixed(2)}` : "R$ 0,00"}
                   </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Gerenciar Imagens</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Label>Novas Imagens</Label>
              <Input type="file" multiple accept="image/*" onChange={handleNewImageUpload} />
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingImages.map((url, i) => (
                  <div key={url} className="relative aspect-square border rounded-lg overflow-hidden group">
                    <img src={url} className="object-cover w-full h-full" alt="Produto" />
                    <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"><X size={14}/></button>
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-[9px] text-white px-1 py-0.5 text-center uppercase font-bold">No Ar</div>
                  </div>
                ))}
                {newImageFiles.map((file, i) => (
                  <div key={i} className="relative aspect-square border-2 border-dashed border-zinc-400 rounded-lg overflow-hidden group">
                    <img src={URL.createObjectURL(file)} className="object-cover w-full h-full opacity-70" alt="Novo" />
                    <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"><X size={14}/></button>
                    <div className="absolute bottom-0 left-0 w-full bg-blue-600/80 text-[9px] text-white px-1 py-0.5 text-center uppercase font-bold">Nova</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Variações e Estoque</CardTitle>
              <Button type="button" size="sm" onClick={addVariation} className="gap-2 bg-zinc-900 text-white">
                <Plus size={16} /> Add Variação
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {variations.map((v) => (
                <div key={v.tempId} className="p-4 border rounded-xl bg-slate-50/50 space-y-4 shadow-sm">
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-gray-500">Tam</Label>
                      <Input value={v.size} onChange={(e) => updateVariation(v.tempId, "size", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-gray-500">Cor</Label>
                      <Input value={v.color} onChange={(e) => updateVariation(v.tempId, "color", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-red-500">SKU / ID</Label>
                      <Input value={v.sku} onChange={(e) => updateVariation(v.tempId, "sku", e.target.value)} className="bg-white" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-gray-500">Estoque</Label>
                      <Input type="number" value={v.stock} onChange={(e) => updateVariation(v.tempId, "stock", Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-gray-500">Preço Dif.</Label>
                      <Input type="number" step="0.01" value={v.priceDiff} onChange={(e) => updateVariation(v.tempId, "priceDiff", Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="flex justify-end border-t pt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setVariations(prev => prev.filter(item => item.tempId !== v.tempId))} 
                      className="text-red-600 hover:bg-red-50 font-bold text-xs"
                    >
                      <Trash2 size={14} className="mr-2" /> REMOVER
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-2">
            <CardHeader><CardTitle className="text-lg">Categoria</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {categories.map((c) => (
                <label key={c.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${categoryId === c.id ? "bg-black text-white border-black" : "hover:bg-slate-50"}`}>
                  <input type="radio" name="category" checked={categoryId === c.id} onChange={() => setCategoryId(c.id)} className="hidden" />
                  <span className="text-sm font-bold uppercase tracking-tight">{c.name}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader><CardTitle className="text-lg">Frete</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Peso (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Altura (cm)</Label><Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Largura (cm)</Label><Input type="number" value={width} onChange={(e) => setWidth(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-[10px] uppercase font-bold">Compr. (cm)</Label><Input type="number" value={length} onChange={(e) => setLength(e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader><CardTitle className="text-lg">Visibilidade</CardTitle></CardHeader>
            <CardContent className="space-y-6 font-medium">
              <div className="flex justify-between items-center"><Label>Ativo</Label><Switch checked={active} onCheckedChange={setActive} /></div>
              <div className="flex justify-between items-center"><Label>Destaque Home</Label><Switch checked={featured} onCheckedChange={setFeatured} /></div>
              <div className="flex justify-between items-center"><Label>Mais Vendido</Label><Switch checked={bestSeller} onCheckedChange={setBestSeller} /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}