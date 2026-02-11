import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email

  if (!userEmail) return NextResponse.json([], { status: 200 })

  const orders = await prisma.order.findMany({
    where: { user: { email: userEmail } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orders)
}
