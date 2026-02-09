import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        active: true,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        title: true,
        image: true,
        link: true,
        category: {
          select: {
            slug: true,
          },
        },
      },
    })

    // 🔹 resolve o link final do banner
    const parsedBanners = banners.map((banner) => ({
      id: banner.id,
      title: banner.title,
      image: banner.image,
      link:
        banner.link ||
        (banner.category ? `/categoria/${banner.category.slug}` : null),
    }))

    return NextResponse.json(parsedBanners)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Erro ao carregar banners" },
      { status: 500 }
    )
  }
}
