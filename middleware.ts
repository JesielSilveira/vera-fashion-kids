import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = req.nextUrl

  // 1. Proteger rotas de ADMIN (Páginas e APIs)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    
    // Se não tiver token, barra na hora
    if (!token) {
      console.log("🚫 Bloqueio: Sem token em", pathname)
      // Se for API, retorna JSON 401. Se for página, redireciona pro login.
      if (pathname.startsWith("/api")) {
        return new NextResponse(JSON.stringify({ error: "Não autorizado" }), { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Se o token existe, mas não é ADMIN
    const userRole = String(token.role || "").toLowerCase()
    if (userRole !== "admin") {
      console.log("🚫 Bloqueio: Role insuficiente:", userRole)
      if (pathname.startsWith("/api")) {
        return new NextResponse(JSON.stringify({ error: "Acesso negado" }), { status: 403 })
      }
      return NextResponse.redirect(new URL("/", req.url))
    }

    console.log("✅ Acesso Admin liberado:", pathname)
  }

  // 2. Proteger Checkout (precisa estar logado, qualquer role)
  if (pathname.startsWith("/checkout")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

// ⚠️ IMPORTANTE: O matcher precisa incluir a API também!
export const config = {
  matcher: [
    "/checkout/:path*", 
    "/admin/:path*", 
    "/api/admin/:path*" // 👈 Adicionado para proteger o banco de dados
  ],
}