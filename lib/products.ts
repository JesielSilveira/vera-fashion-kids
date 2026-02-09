// lib/products.ts
import { prisma } from "./prisma"

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true, active: true },
    orderBy: { createdAt: "desc" },
    take: 8, // opcional: pegar só os 8 últimos
  })
}