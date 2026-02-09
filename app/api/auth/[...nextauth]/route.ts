export const dynamic = 'force-dynamic';

import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ): Promise<any> {
        try {
          if (!credentials) return null

          const { email, password } = credentials

          if (!email || !password) return null

          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user) return null

          // ⚠️ depois troca por bcrypt.compare(password, user.password)

          return {
            id: user.id,
            name: user.name ?? "",
            email: user.email,
            role: user.role.toLowerCase(),
          }
        } catch (err) {
          console.error("AUTHORIZE ERROR:", err)
          return null
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "admin" | "user"
      }

      return session
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }