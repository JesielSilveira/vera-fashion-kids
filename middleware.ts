import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  console.log("🚀 Middleware token:", token) // 🔹 log do token

  const { pathname } = req.nextUrl

  // 🔒 Checkout → precisa estar logado
  if (pathname.startsWith("/checkout")) {
    if (!token) {
      console.log("Redirect /checkout → login")
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // 🔒 Admin → precisa ser admin
  if (pathname.startsWith("/admin")) {
    if (!token) {
      console.log("Redirect /admin → / (sem token)")
      return NextResponse.redirect(new URL("/", req.url))
    }

    // 🔹 verificação de role
    if (token.role?.toLowerCase() !== "admin") {
      console.log("Redirect /admin → / (role não é admin)", token.role)
      return NextResponse.redirect(new URL("/", req.url))
    }

    console.log("✅ Acesso admin liberado")
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/checkout/:path*", "/admin/:path*"],
}
