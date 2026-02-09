import { Product } from "@/types/product"

export const products: Product[] = [
  {
    id: "1",
    slug: "fone-bluetooth",
    name: "Fone Bluetooth",
    price: 199.9,
    oldPrice: 299.9,
    image: "/products/fone.jpg",
    categories: ["eletronicos"],
  },
  {
    id: "2",
    slug: "smartwatch",
    name: "Smartwatch",
    price: 349.9,
    oldPrice: 449.9,
    image: "/products/smartwatch.jpg",
    categories: ["eletronicos"],
  },
  {
    id: "3",
    slug: "tenis-esportivo",
    name: "Tênis Esportivo",
    price: 259.9,
    image: "/products/tenis.jpg",
    categories: ["calcados"],
  },
  {
    id: "4",
    slug: "cafeteira",
    name: "Cafeteira",
    price: 499.9,
    oldPrice: 599.9,
    image: "/products/cafeteira.jpg",
    categories: ["eletronicos", "casa"],
  },
]