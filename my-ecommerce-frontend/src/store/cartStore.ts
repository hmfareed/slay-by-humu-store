// src/store/cartStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '@/src/lib/api';

const API_BAR_URL = API_URL;

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    category?: string | { name: string; _id: string };
    description?: string;
  };
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: { _id: string; name: string; price: number; images: string[]; category?: string | { name: string; _id: string }; description?: string; quantity?: number }) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  setItems: (items) => set({ items }),

  addItem: async (product) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Optimistic UI update
    set((state) => {
      const existing = state.items.findIndex(item => item.product._id === product._id);
      if (existing !== -1) {
        const updated = [...state.items];
        updated[existing].quantity += 1;
        return { items: updated };
      } else {
        return { items: [...state.items, { product, quantity: 1 }] };
      }
    });

    // Sync with backend if logged in
    if (token) {
      try {
        await axios.post(`${API_BAR_URL}/cart`, {
          productId: product._id,
          quantity: 1
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Failed to sync cart with backend:', error);
      }
    }
  },

  removeItem: async (productId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Optimistic UI update
    set((state) => ({
      items: state.items.filter(item => item.product._id !== productId)
    }));

    // Sync with backend if logged in
    if (token) {
      try {
        await axios.delete(`${API_BAR_URL}/cart/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Failed to remove item from backend cart:', error);
      }
    }
  },

  clearCart: () => set({ items: [] }),

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }
}));