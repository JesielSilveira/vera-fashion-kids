export const dynamic = "force-dynamic"

import Image from "next/image";
import { BannerCarousel } from "./_components/BannerCarousel";
import { Categories } from "./_components/Categories";
import { FeaturedProducts } from "./_components/FeaturedProducts";
import { BestSellers } from "./_components/BestSellers";
import { Newsletter } from "./_components/Newsletter";

export default function Home() {
  return (
    <main>
      <BannerCarousel/>
      <Categories/>
      <FeaturedProducts/>
      <BestSellers/>
      <Newsletter/>
    </main>
  );
}
