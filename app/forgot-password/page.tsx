"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return <p>Um email foi enviado para redefinir sua senha (verifique spam).</p>
  }

  return (
    <section className="mx-auto max-w-md px-4 py-20">
      <h1 className="mb-6 text-3xl font-bold">Esqueci minha senha</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button className="w-full" disabled={loading}>
          {loading ? "Enviando..." : "Enviar email"}
        </Button>
      </form>
    </section>
  )
}
