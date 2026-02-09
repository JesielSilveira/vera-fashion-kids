import { useCartStore } from "@/store/cart-store"
import { Product } from "@/types/product"

export function addToCart(product: Product) {
  useCartStore.getState().addItem(product)
}
