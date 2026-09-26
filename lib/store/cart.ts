import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  hotel_id: string
  hotel_name: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items
        const existingIndex = currentItems.findIndex((i) => i.id === item.id)

        if (existingIndex > -1) {
          const updatedItems = [...currentItems]
          updatedItems[existingIndex].quantity += item.quantity
          set({ items: updatedItems })
        } else {
          set({ items: [...currentItems, item] })
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'hostelbites-cart-storage',
    }
  )
)
