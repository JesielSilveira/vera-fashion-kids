"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();

  // ✅ garante string
  const id = typeof params?.id === "string" ? params.id : null;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // =========================
  // Load categoria
  // =========================
  useEffect(() => {
    if (!id) {
      alert("ID inválido");
      router.push("/admin/categorias");
      return;
    }

    async function loadCategory() {
      try {
        const res = await fetch(`/api/admin/categories/${id}`);
        if (!res.ok) {
          alert("Categoria não encontrada");
          router.push("/admin/categorias");
          return;
        }

        const data = await res.json();
        setName(data.name ?? "");
        setSlug(data.slug ?? "");
        setActive(!!data.active);
      } catch (err) {
        console.error("Erro ao carregar categoria:", err);
        alert("Erro ao carregar categoria");
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [id, router]);

  // =========================
  // Atualizar categoria
  // =========================
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, active }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.message || "Erro ao atualizar categoria");
      }

      router.push("/admin/categorias");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // Deletar categoria
  // =========================
  async function handleDelete() {
    if (!id) return;
    if (!confirm("Deseja realmente deletar essa categoria?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.message || "Erro ao deletar categoria");
      }

      router.push("/admin/categorias");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro desconhecido");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando categoria...</p>;

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Categoria</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>

          <div className="flex items-center justify-between">
            <Label>Ativa</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving || deleting}>
          {saving ? "Salvando..." : "Atualizar"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={saving || deleting}
        >
          {deleting ? "Deletando..." : "Deletar"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving || deleting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
