"use client"

import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    setLoading(false)

    if (res.ok) {
      setEmail("")
      alert("Email cadastrado com sucesso!")
    } else {
      alert("Erro ao cadastrar email")
    }
  }

  return (
    <section className="bg-muted py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>

        <h2 className="mb-2 text-3xl font-bold">
          Receba ofertas exclusivas
        </h2>
        <p className="mb-8 text-muted-foreground">
          Cadastre seu e-mail e seja o primeiro a saber sobre promoções e novidades.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <Input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Inscrever-se"}
          </Button>
        </form>
      </div>
    </section>
  )
}
