import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ 0. LIBERAÇÃO PÚBLICA (Sem Token)
  // Liberamos o Webhook (Stripe) e a rota de Check (Página de Sucesso)
  if (pathname.startsWith("/api/stripe/webhook") || pathname === "/api/orders/check") {
    return NextResponse.next()
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // 1. Proteger rotas de ADMIN
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!token) {
      if (pathname.startsWith("/api")) {
        return new NextResponse(JSON.stringify({ error: "Não autorizado" }), { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const userRole = String(token.role || "").toLowerCase()
    if (userRole !== "admin") {
      if (pathname.startsWith("/api")) {
        return new NextResponse(JSON.stringify({ error: "Acesso negado" }), { status: 403 })
      }
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // 2. Proteger Checkout
  if (pathname.startsWith("/checkout")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/checkout/:path*", 
    "/admin/:path*", 
    "/api/admin/:path*",
    "/api/webhook/:path*",
    "/api/orders/check" // ✅ Adicionado para ser processado pelo Middleware
  ],
}