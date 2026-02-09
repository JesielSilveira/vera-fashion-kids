import NextAuth from "next-auth"
import { DefaultSession } from "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "admin" | "user"
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: "admin" | "user"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "admin" | "user"
  }
}