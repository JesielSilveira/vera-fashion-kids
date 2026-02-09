export type Banner = {
  id: number
  title: string
  imageUrl: string
  link: string
  order: number
  active: boolean
}

export const banners: Banner[] = [
  {
    id: 1,
    title: "Promoção de Verão",
    imageUrl: "/banners/banner-1.jpg",
    link: "/categoria/calcados",
    order: 1,
    active: true,
  },
  {
    id: 2,
    title: "Novos Eletrônicos",
    imageUrl: "/banners/banner-2.jpg",
    link: "/categoria/eletronicos",
    order: 2,
    active: true,
  },
]
