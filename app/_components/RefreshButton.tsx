"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function RefreshButton() {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      onClick={() => router.refresh()}
    >
      Atualizar dados
    </Button>
  )
}
