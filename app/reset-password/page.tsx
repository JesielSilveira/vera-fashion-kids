"use client"

import { useState, Suspense } from "react" // 1. Importe o Suspense
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"

// 2. Crie um sub-componente com a lógica do formulário
function ResetPasswordForm() {
  const params = useSearchParams()
  const token = params.get("token") ?? ""
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    if (res.ok) setDone(true)
    setLoading(false)
  }

  if (done) return <p className="py-20 text-center">Senha redefinida com sucesso! Agora faça login.</p>

  return (
    <section className="mx-auto max-w-md px-4 py-20">
      <h1 className="mb-6 text-3xl font-bold">Redefinir senha</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button className="w-full" disabled={loading}>
          {loading ? "Redefinindo..." : "Redefinir senha"}
        </Button>
      </form>
    </section>
  )
}

// 3. O export default envolve o formulário em Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}