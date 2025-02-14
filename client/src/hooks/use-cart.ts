import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  decrementItem: (id: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === item.id);
        
        if (existingItem) {
          const updatedItems = items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
          set({ items: updatedItems, total: calculateTotal(updatedItems) });
        } else {
          const updatedItems = [...items, { ...item, quantity: 1 }];
          set({ items: updatedItems, total: calculateTotal(updatedItems) });
        }
      },
      removeItem: (id) => {
        const updatedItems = get().items.filter((i) => i.id !== id);
        set({ items: updatedItems, total: calculateTotal(updatedItems) });
      },
      decrementItem: (id) => {
        const items = get().items;
        const item = items.find((i) => i.id === id);
        
        if (item && item.quantity > 1) {
          const updatedItems = items.map((i) =>
            i.id === id ? { ...i, quantity: i.quantity - 1 } : i
          );
          set({ items: updatedItems, total: calculateTotal(updatedItems) });
        } else if (item && item.quantity === 1) {
          const updatedItems = items.filter((i) => i.id !== id);
          set({ items: updatedItems, total: calculateTotal(updatedItems) });
        }
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};
