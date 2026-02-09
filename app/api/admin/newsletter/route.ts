export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const emails = await prisma.newsletterEmail.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(emails)
}
