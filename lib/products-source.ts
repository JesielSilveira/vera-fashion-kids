// lib/products-source.ts
export async function getProducts() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    const { products } = await import("./mock/product")
    return products
  }

  const res = await fetch("/api/products")
  return res.json()
}