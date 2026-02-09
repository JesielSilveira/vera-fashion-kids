"use client"

import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function LogoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // redireciona automaticamente se não estiver logado
  useEffect(() => {
    if (status === "loading") return

    if (!session) router.push("/login")
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500 text-lg">Carregando sessão...</p>
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20 flex flex-col gap-6 items-center text-center">
      <h1 className="text-3xl font-bold">Bem-vindo(a)!</h1>
      <p className="text-gray-600">
        Você está logado como <span className="font-semibold">{session?.user?.name}</span>
      </p>
      <p className="text-gray-600">Email: {session?.user?.email}</p>
      <p className="text-gray-600">Função: {session?.user?.role}</p>

      {session?.user?.role === "admin" && (
        <Button
          className="w-full max-w-xs"
          onClick={() => router.push("/admin")}
        >
          Ir para Painel Admin
        </Button>
      )}

      <Button
        variant="destructive"
        className="w-full max-w-xs"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sair
      </Button>
    </section>
  )
}