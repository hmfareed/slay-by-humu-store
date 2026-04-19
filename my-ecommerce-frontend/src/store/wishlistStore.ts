import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '@/src/lib/api';

const API_BAR_URL = API_URL;

interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category?: string;
  description?: string;
}

interface WishlistStore {
  items: WishlistProduct[];
  setItems: (items: WishlistProduct[]) => void;
  addItem: (product: WishlistProduct) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],

  setItems: (items) => set({ items }),

  addItem: async (product) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Optimistic UI update
    set((state) => {
      if (state.items.find((item) => item._id === product._id)) return state;
      return { items: [...state.items, product] };
    });

    // Sync with backend if logged in
    if (token) {
      try {
        await axios.post(`${API_BAR_URL}/wishlist`, { productId: product._id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Failed to sync wishlist to database', error);
      }
    }
  },

  removeItem: async (productId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Optimistic clean
    set((state) => ({
      items: state.items.filter((item) => item._id !== productId),
    }));

    if (token) {
      try {
        await axios.delete(`${API_BAR_URL}/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Failed to remove from database wishlist', error);
      }
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((item) => item._id === productId);
  },

  clearWishlist: () => set({ items: [] }),
}));
