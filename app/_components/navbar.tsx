"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ShoppingCart, Search, User } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

import logo from "../../public/logo.png"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/cart-store"

export function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const [search, setSearch] = useState("")

  const items = useCartStore((state) => state.items)
  const totalItems = items.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()

    if (!search.trim()) return

    router.push(`/buscar?q=${encodeURIComponent(search)}`)
    setSearch("")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#d33970]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">

        {/* LOGO */}
        <Link href="/" className="shrink-0">
          <Image
            src={logo}
            alt="Logo"
            className="h-14 w-auto"
            priority
          />
        </Link>

        {/* BUSCA */}
        <form
          onSubmit={handleSearch}
          className="relative hidden flex-1 md:block"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produtos..."
            className="pl-9"
          />
        </form>

        {/* AÇÕES */}
        <div className="flex items-center gap-4">

          {!session ? (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm md:block text-white">
                Olá, {session.user?.name}
              </span>

              {/* 👤 MINHA CONTA */}
              <Link href="/minha-conta">
                <Button variant="outline" size="sm">
                  Minha conta
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
              >
                Sair
              </Button>
            </div>
          )}

          {/* CARRINHO */}
          <Link href="/carrinho" className="relative">
            <ShoppingCart className="h-6 w-6 text-white" />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
