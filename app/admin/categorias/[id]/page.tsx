"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { makeProductSlug } from "@/lib/slugify"; // Importando sua lib de slug

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : null;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [active, setActive] = useState(true);
  
  // Estados para Imagem
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadCategory() {
      try {
        const res = await fetch(`/api/admin/categories/${id}`);
        if (!res.ok) throw new Error();

        const data = await res.json();
        setName(data.name ?? "");
        setSlug(data.slug ?? "");
        setActive(!!data.active);
        setExistingImage(data.image ?? null);
      } catch (err) {
        alert("Erro ao carregar categoria");
        router.push("/admin/categorias");
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [id, router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setNewFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    try {
      let imageUrl = existingImage;

      // 1️⃣ Se houver nova imagem, faz upload primeiro
      if (newFile) {
        const formData = new FormData();
        formData.append("file", newFile);

        const uploadRes = await fetch("/api/upload/category", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Erro no upload da imagem");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // 2️⃣ Atualiza a categoria
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          slug: slug || makeProductSlug(name), 
          active,
          image: imageUrl 
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar categoria");

      router.push("/admin/categorias");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm("Deseja deletar essa categoria?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/admin/categorias");
    } catch (err) {
      alert("Erro ao deletar");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-muted-foreground">Carregando...</div>;

  return (
    <form onSubmit={handleUpdate} className="space-y-6 max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold">Editar Categoria</h1>

      <Card>
        <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input 
              value={name} 
              onChange={(e) => {
                setName(e.target.value);
                setSlug(makeProductSlug(e.target.value));
              }} 
              required 
            />
          </div>

          <div>
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(makeProductSlug(e.target.value))} required />
          </div>

          <div>
            <Label>Imagem da Categoria</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
            
            {/* Mostrar preview da nova imagem OU a imagem atual do banco */}
            {(preview || existingImage) && (
              <div className="relative w-40 h-40 border rounded-lg overflow-hidden bg-muted">
                <img
                  src={preview || existingImage!}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-0 right-0 bg-black/60 text-[10px] text-white px-2 py-1">
                  {preview ? "Nova" : "Atual"}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Label>Ativa</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving || deleting}>
          {saving ? "Salvando..." : "Atualizar"}
        </Button>
        <Button type="button" variant="destructive" onClick={handleDelete} disabled={saving || deleting}>
          {deleting ? "Deletando..." : "Deletar"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}