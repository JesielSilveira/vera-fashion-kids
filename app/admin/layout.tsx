import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log("🟢 ADMIN LAYOUT ENTROU") // 🔥 LOG CRÍTICO

  const session = await getServerSession(authOptions)

  console.log("🟢 ADMIN SESSION >>>", session)

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role.toLowerCase() !== "admin") {
    redirect("/")
  }


  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}