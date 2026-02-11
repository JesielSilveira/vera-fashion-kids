import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ 0. LIBERAÇÃO CRÍTICA: Ignorar o Webhook do Stripe
  // O Stripe não envia token, por isso ele SEMPRE seria bloqueado se caísse em qualquer regra.
  if (pathname.startsWith("/api/webhooks")) {
    return NextResponse.next()
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // 1. Proteger rotas de ADMIN (Páginas e APIs)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    
    if (!token) {
      console.log("🚫 Bloqueio: Sem token em", pathname)
      if (pathname.startsWith("/api")) {
        return new NextResponse(JSON.stringify({ error: "Não autorizado" }), { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const userRole = String(token.role || "").toLowerCase()
    if (userRole !== "admin") {
      console.log("🚫 Bloqueio: Role insuficiente:", userRole)
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
    "/api/webhooks/:path*" // ✅ Adicionamos aqui para o middleware saber que ele deve olhar essa rota (e liberar no if acima)
  ],
}