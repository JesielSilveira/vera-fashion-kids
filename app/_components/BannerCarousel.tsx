"use client"
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type Banner = {
  id: string
  title: string
  image: string
  link: string | null
}

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then(setBanners)
      .catch(console.error)
  }, [])

  if (!banners.length) return null

  return (
    <section className="relative w-full overflow-hidden">
      <Carousel
        opts={{ loop: true }}
        plugins={[
          Autoplay({
            delay: 4000,           // tempo entre slides (ms)
            stopOnInteraction: false, // continua mesmo se clicar
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <Link href={banner.link || "#"} className="block w-full">
                <div
                  className="
                    relative w-full
                    h-[220px] sm:h-[300px]
                    md:h-[420px] lg:h-[520px]
                    overflow-hidden
                  "
                >
                  {/* ✅ Next.js 13+ modo seguro */}
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    sizes="100vw"
                    style={{ objectFit: "cover" }}
                    priority
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40" />

                  {/* Texto */}
                  <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                    <h2 className="text-white font-bold text-xl sm:text-2xl md:text-4xl drop-shadow">
                      {banner.title}
                    </h2>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navegação */}
        <CarouselPrevious className="left-3" />
        <CarouselNext className="right-3" />
      </Carousel>
    </section>
  )
}
