"use client"

import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm("Excluir produto?")) return

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      alert("Erro ao excluir")
      return
    }

    router.refresh()
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete}>
      <Trash className="h-4 w-4" />
    </Button>
  )
}
