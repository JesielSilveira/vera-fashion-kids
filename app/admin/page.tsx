import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { RefreshButton } from "@/app/_components/RefreshButton"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function AdminPage() {
  /* ======================
      MÉTRICAS
  ====================== */

  const [
    productsCount,
    activeCategoriesCount,
    ordersCount,
    revenueResult,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count({
      where: { active: true },
    }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
    }),
  ])

  const revenue = revenueResult._sum.total || 0

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do painel administrativo
          </p>
        </div>

        <RefreshButton />
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {productsCount}
            </p>
            <p className="text-xs text-muted-foreground">
              cadastrados
            </p>
          </CardContent>
        </Card>
        
        <Link href="/admin/pedidos">
          <Card className="cursor-pointer transition hover:border-primary hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {ordersCount}
              </p>
              <p className="text-xs text-muted-foreground">
                no total
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Categorias
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {activeCategoriesCount}
            </p>
            <p className="text-xs text-muted-foreground">
              ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {revenue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              acumulado
            </p>
          </CardContent>
        </Card>

      </div>

      {/* ATALHOS */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Acesso rápido
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <Link href="/admin/produtos">
            <Card className="cursor-pointer transition hover:border-primary hover:shadow-md">
              <CardHeader>
                <CardTitle>Produtos</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Gerenciar produtos da loja
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/categorias">
            <Card className="cursor-pointer transition hover:border-primary hover:shadow-md">
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Organizar categorias
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/banners">
            <Card className="cursor-pointer transition hover:border-primary hover:shadow-md">
              <CardHeader>
                <CardTitle>Banners</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Banners e campanhas
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/newsletter">
            <Card className="cursor-pointer transition hover:border-primary hover:shadow-md">
              <CardHeader>
                <CardTitle>Newsletter</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Emails cadastrados para campanhas
              </CardContent>
            </Card>
          </Link>

          {/* SUPORTE AO CLIENTE ADICIONADO AQUI */}
          <Link href="/admin/suporte">
            <Card className="cursor-pointer transition hover:border-primary hover:shadow-md">
              <CardHeader>
                <CardTitle>Suporte</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Mensagens enviadas pelo contato
              </CardContent>
            </Card>
          </Link>

        </div>
      </div>

    </div>
  )
}