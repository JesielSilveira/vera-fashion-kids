export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$connect()

    const result = await prisma.$queryRaw`SELECT 1`

    return Response.json({
      ok: true,
      result,
    })
  } catch (error) {
    console.error("DB ERROR:", error)
    return new Response(
      JSON.stringify({
        ok: false,
        error: String(error),
      }),
      { status: 500 }
    )
  }
}