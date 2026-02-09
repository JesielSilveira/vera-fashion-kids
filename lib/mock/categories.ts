export type Category = {
  id: number
  name: string
  slug: string
  image: string
  active: boolean
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Calçados",
    slug: "calcados",
    image: "/categories/calcados.jpg",
    active: true,
  },
  {
    id: 2,
    name: "Eletrônicos",
    slug: "eletronicos",
    image: "/categories/eletronicos.jpg",
    active: true,
  },
  {
    id: 3,
    name: "Moda",
    slug: "moda",
    image: "/categories/moda.jpg",
    active: false,
  },
]