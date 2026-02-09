"use client"

import { signIn, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔁 se já estiver logado
  useEffect(() => {
    if (status !== "authenticated") return

    if (session.user.role === "admin") router.replace("/admin")
    else router.replace("/")
  }, [session, status, router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // 🔥 deixa a gente controlar
    })

    setLoading(false)

    if (res?.ok) {
      // força reload da session
      router.refresh()
    } else {
      alert("Email ou senha inválidos")
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-20">
      <h1 className="mb-6 text-3xl font-bold">Entrar</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button className="w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>

      
      </form>
      <div>
        <a href="/register">
        <Button variant="outline" className="w-full">
          Criar conta
        </Button>
       </a>
        {/* Botão para esqueci a senha */}
        <Button
          variant="ghost"
          className="w-full ml-2"
          onClick={() => router.push("/forgot-password")}
        >
          Esqueci a senha
        </Button>
      </div>
    </section>
  )
}