import { create } from "zustand"

export type CartProduct = {
  id: string
  slug: string
  name: string
  price: number
  image?: string | null
}

export type CartItem = CartProduct & {
  quantity: number
  size?: string
  color?: string
}

type CartStore = {
  items: CartItem[]

  addItem: (product: CartProduct, size?: string, color?: string) => void
  addFrete: (item: CartItem) => void

  incrementItem: (id: string, size?: string, color?: string) => void
  decrementItem: (id: string, size?: string, color?: string) => void
  removeItem: (id: string, size?: string, color?: string) => void

  clearCart: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product, size, color) => {
    const items = get().items

    const existing = items.find(
      (i) =>
        i.id === product.id &&
        i.size === size &&
        i.color === color
    )

    if (existing) {
      set({
        items: items.map((i) =>
          i === existing
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      })
    } else {
      set({
        items: [
          ...items,
          { ...product, quantity: 1, size, color },
        ],
      })
    }
  },

  addFrete: (item) =>
    set({
      items: [
        ...get().items.filter(
          (i) => i.id !== "frete-pac" && i.id !== "frete-sedex"
        ),
        item,
      ],
    }),

  incrementItem: (id, size, color) =>
    set({
      items: get().items.map((i) =>
        i.id === id &&
        i.size === size &&
        i.color === color
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ),
    }),

  decrementItem: (id, size, color) =>
    set({
      items: get().items
        .map((i) =>
          i.id === id &&
          i.size === size &&
          i.color === color
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0),
    }),

  removeItem: (id, size, color) =>
    set({
      items: get().items.filter(
        (i) =>
          !(
            i.id === id &&
            i.size === size &&
            i.color === color
          )
      ),
    }),

  clearCart: () => set({ items: [] }),
}))

