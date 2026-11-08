// src/store/cartStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '@/src/lib/api';

const API_BAR_URL = API_URL;

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category?: string | { name: string; _id: string };
  description?: string;
  selectedLength?: string;
  selectedDensity?: string;
  itemKey?: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

const getItemKey = (p: CartProduct) =>
  p.itemKey || (p.selectedLength ? `${p._id}-${p.selectedLength}-${p.selectedDensity || ''}` : p._id);

interface CartStore {
  items: CartItem[];
  addItem: (product: CartProduct & { quantity?: number }) => Promise<void>;
  removeItem: (itemKeyOrId: string) => Promise<void>;
  updateQuantity: (itemKeyOrId: string, quantity: number) => Promise<void>;
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
    const itemKey = getItemKey(product);
    const productWithKey: CartProduct = { ...product, itemKey };
    
    // Optimistic UI update
    set((state) => {
      const existing = state.items.findIndex(item => getItemKey(item.product) === itemKey);
      if (existing !== -1) {
        const updated = [...state.items];
        updated[existing].quantity += (product.quantity || 1);
        return { items: updated };
      } else {
        return { items: [...state.items, { product: productWithKey, quantity: product.quantity || 1 }] };
      }
    });

    // Sync with backend if logged in
    if (token) {
      try {
        await axios.post(`${API_BAR_URL}/cart`, {
          productId: product._id,
          quantity: product.quantity || 1,
          selectedLength: product.selectedLength,
          selectedDensity: product.selectedDensity,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Failed to sync cart with backend:', error);
      }
    }
  },

  removeItem: async (itemKeyOrId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    let targetProductId = itemKeyOrId;
    const itemToRemove = get().items.find(item => getItemKey(item.product) === itemKeyOrId || item.product._id === itemKeyOrId);
    if (itemToRemove) {
      targetProductId = itemToRemove.product._id;
    }

    // Optimistic UI update
    set((state) => ({
      items: state.items.filter(item => getItemKey(item.product) !== itemKeyOrId && item.product._id !== itemKeyOrId)
    }));

    // Sync with backend if logged in
    if (token) {
      try {
        await axios.delete(`${API_BAR_URL}/cart/${targetProductId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Failed to remove item from backend cart:', error);
      }
    }
  },

  updateQuantity: async (itemKeyOrId: string, quantity: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (quantity <= 0) {
      await get().removeItem(itemKeyOrId);
      return;
    }

    let targetProductId = itemKeyOrId;
    // Optimistic UI update
    set((state) => {
      const existing = state.items.findIndex(item => getItemKey(item.product) === itemKeyOrId || item.product._id === itemKeyOrId);
      if (existing !== -1) {
        targetProductId = state.items[existing].product._id;
        const updated = [...state.items];
        updated[existing].quantity = quantity;
        return { items: updated };
      }
      return state;
    });

    // Sync with backend if logged in
    if (token) {
      try {
        await axios.put(`${API_BAR_URL}/cart/${targetProductId}`, {
          quantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Failed to update quantity on backend:', error);
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