import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../api/productApi';
import { toast } from 'sonner';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product & { quantity?: number }) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.productId);
          const quantityToAdd = product.quantity || 1;
          
          if (existingItem) {
            // Check stock limit (mock behavior: assuming we cannot exceed stock)
            const newQuantity = existingItem.quantity + quantityToAdd;
            if (newQuantity > product.stock) {
              toast.error(`Chỉ còn ${product.stock} sản phẩm trong kho`);
              return state;
            }
            toast.success('Đã cập nhật giỏ hàng thành công');
            return {
              items: state.items.map((item) =>
                item.productId === product.productId ? { ...item, quantity: newQuantity } : item
              ),
            };
          }
          
          toast.success('Đã thêm thành công');
          return { items: [...state.items, { ...product, quantity: quantityToAdd }] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
        toast.info('Đã xóa khỏi giỏ hàng');
      },
      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.productId !== productId) };
          }
          
          const item = state.items.find(i => i.productId === productId);
          if (item && quantity > item.stock) {
            toast.error(`Chỉ còn ${item.stock} sản phẩm trong kho`);
            return state;
          }
          
          return {
            items: state.items.map((item) =>
              item.productId === productId ? { ...item, quantity } : item
            ),
          };
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'teddy-shop-cart',
    }
  )
);
