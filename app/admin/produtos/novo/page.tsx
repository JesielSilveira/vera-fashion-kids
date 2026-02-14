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
import { X, Plus, Trash2, Banknote } from "lucide-react"

type Category = {
  id: string
  name: string
  active: boolean
}

type Variation = {
  tempId: number 
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

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [active, setActive] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [bestSeller, setBestSeller] = useState(false)

  const [images, setImages] = useState<File[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [variations, setVariations] = useState<Variation[]>([])

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

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files
    if (!files) return
    setImages((prev) => [...prev, ...Array.from(files)])
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  function addVariation() {
    setVariations((prev) => [
      ...prev,
      { 
        tempId: Date.now(),
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
      const formData = new FormData()
      images.forEach((file) => formData.append("files", file))

      const uploadRes = await fetch("/api/upload/product", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) throw new Error("Erro no upload das imagens")
      const { urls } = await uploadRes.json()

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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto pb-20 p-4 overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Novo Produto</h1>
          <p className="text-muted-foreground italic">Configuração geral e preço com 9% OFF PIX automático.</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-black hover:bg-zinc-800">
            {isSubmitting ? "Salvando..." : "Salvar Produto"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8 min-w-0"> {/* min-w-0 evita quebra de layout lateral */}
          
          <Card className="border-2 shadow-sm">
            <CardHeader><CardTitle className="text-lg">Informações Gerais</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-bold">Nome do Produto</Label>
                <Input
                  id="name"
                  placeholder="Ex: Camiseta de Algodão Premium"
                  className="h-12"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setSlug(makeProductSlug(e.target.value))
                  }}
                />
              </div>

              {/* SLUG CORRIGIDO PARA NÃO CORTAR E NÃO IR PARA O LADO */}
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold text-gray-400">Link do Produto (Slug)</Label>
                <div className="p-3 bg-slate-50 border rounded-md text-sm text-zinc-500 break-all font-mono">
                  {slug || "O link será gerado automaticamente..."}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description" className="font-bold">Descrição (Respeita parágrafos)</Label>
                <Textarea
                  id="description"
                  rows={8}
                  className="min-h-[200px] leading-relaxed resize-y whitespace-pre-wrap" // whitespace-pre-wrap essencial para o dono ver as quebras
                  placeholder="Descreva seu produto. Use 'Enter' para pular linhas."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="price" className="font-bold">Preço Base (Cartão)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    className="h-12 text-lg font-semibold"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Variações e Estoque</CardTitle>
              <Button type="button" size="sm" onClick={addVariation} className="gap-2 bg-zinc-900">
                <Plus size={16} /> Add Variação
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {variations.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground italic">
                  Nenhuma variação (Cor/Tamanho) adicionada.
                </div>
              )}
              {variations.map((v) => (
                <div key={v.tempId} className="p-4 border rounded-xl bg-slate-50/50 space-y-4 shadow-sm">
                  {/* Grid responsivo: em mobile fica 2 colunas, em desktop 5. Evita "esmagar" o SKU */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-gray-500">Tamanho</Label>
                      <Input value={v.size} onChange={(e) => updateVariation(v.tempId, "size", e.target.value)} placeholder="P, M, G..." />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-gray-500">Cor</Label>
                      <Input value={v.color} onChange={(e) => updateVariation(v.tempId, "color", e.target.value)} placeholder="Azul..." />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-red-500">SKU / ID</Label>
                      <Input 
                        value={v.sku} 
                        onChange={(e) => updateVariation(v.tempId, "sku", e.target.value)} 
                        placeholder="ID-001" 
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-gray-500">Estoque</Label>
                      <Input type="number" value={v.stock} onChange={(e) => updateVariation(v.tempId, "stock", Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-gray-500">Dif. Preço</Label>
                      <Input type="number" step="0.01" value={v.priceDiff} onChange={(e) => updateVariation(v.tempId, "priceDiff", Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="flex justify-end border-t pt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeVariation(v.tempId)} 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold text-xs"
                    >
                      <Trash2 size={14} className="mr-2" /> REMOVER VARIAÇÃO
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* COLUNA LATERAL DIREITA */}
        <div className="space-y-8">
          <Card className="border-2">
            <CardHeader><CardTitle className="text-lg">Categoria Principal</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {categories.map((c) => (
                <label key={c.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${categoryId === c.id ? "bg-black text-white border-black" : "hover:bg-slate-50"}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={categoryId === c.id}
                    onChange={() => setCategoryId(c.id)}
                    className="w-4 h-4 accent-white hidden"
                  />
                  <span className="text-sm font-bold uppercase tracking-tight">{c.name}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader><CardTitle className="text-lg">Configurações de Exibição</CardTitle></CardHeader>
            <CardContent className="space-y-6 font-medium">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <Label>Produto Ativo</Label>
                  <p className="text-[10px] text-muted-foreground uppercase">Exibir na loja</p>
                </div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <Label>Destaque Home</Label>
                  <p className="text-[10px] text-muted-foreground uppercase">Carrossel inicial</p>
                </div>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <Label>Mais Vendido</Label>
                  <p className="text-[10px] text-muted-foreground uppercase">Selo de popularidade</p>
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