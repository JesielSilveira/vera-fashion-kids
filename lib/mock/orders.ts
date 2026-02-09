export type OrderItem = {
  id: number
  name: string
  price: number
  quantity: number
  size: string
  color: string
}

export type Order = {
  id: string
  userEmail: string
  items: OrderItem[]
  total: number
  status: "pending" | "paid" | "shipped"
  createdAt: string
}


export const orders = [
  {
    id: "ORD-001",
    customer: "João Silva",
    total: 519.8,
    status: "paid",
    items: [
      {
        name: "Tênis Esportivo",
        quantity: 2,
        price: 259.9,
      },
    ],
    createdAt: "2026-01-10",
  },
  {
    id: "ORD-002",
    customer: "Maria Oliveira",
    total: 259.9,
    status: "pending",
    items: [
      {
        name: "Tênis Esportivo",
        quantity: 1,
        price: 259.9,
      },
    ],
    createdAt: "2026-01-11",
  },
]
