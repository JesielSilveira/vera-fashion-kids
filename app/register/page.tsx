"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    })

    if (res.ok) {
      router.push("/login")
    } else {
      alert("Erro ao criar conta")
    }

    setLoading(false)
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16 space-y-6">
      <h1 className="text-3xl font-bold text-center">
        Criar conta
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" placeholder="Nome completo" required />
        <Input name="email" type="email" placeholder="Email" required />
        <Input
          name="password"
          type="password"
          placeholder="Senha"
          required
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Criando..." : "Criar conta"}
        </Button>
      </form>

      <p className="text-center text-sm">
        Já tem conta?{" "}
        <Link href="/login" className="underline">
          Entrar
        </Link>
      </p>
    </section>
  )
}
