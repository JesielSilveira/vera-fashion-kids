"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Deseja realmente excluir este produto?")) return

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Falha ao deletar produto")

      // 🔹 Atualiza o Server Component do admin
      router.refresh()
    } catch (err: any) {
      alert(err.message || "Erro ao deletar produto")
    }
  }

  return (
    <Button variant="destructive" size="icon" onClick={handleDelete}>
      🗑️
    </Button>
  )
}
