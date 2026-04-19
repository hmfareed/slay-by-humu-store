'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/src/store/cartStore';
import { useWishlistStore } from '@/src/store/wishlistStore';
import { API_URL } from '@/src/lib/api';

const API = API_URL;

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Init from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUser({ _id: payload.id, name: payload.name || '', email: payload.email || '', role: payload.role || 'user', avatar: payload.avatar });
        fetchUserData(storedToken);
      } catch {
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const fetchUserData = async (activeToken: string) => {
    try {
      // Fetch Wishlist
      const wlRes = await fetch(`${API}/wishlist`, { headers: { Authorization: `Bearer ${activeToken}` } });
      if (wlRes.ok) {
        const wlData = await wlRes.json();
        // The endpoint returns `{ items: [...] }`, where items contain `.product`. We want an array of products for the frontend store.
        const formattedWishlist = wlData.items.map((i: any) => i.product);
        useWishlistStore.getState().setItems(formattedWishlist);
      }
      
      // Fetch Cart
      const cartRes = await fetch(`${API}/cart`, { headers: { Authorization: `Bearer ${activeToken}` } });
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        useCartStore.getState().setItems(cartData.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch secured data', err);
    }
  };

  const login = useCallback((newToken: string, userInfo: UserInfo) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userInfo);
    fetchUserData(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    
    // Clear global stores to prevent state leaking between users on same device
    useCartStore.getState().clearCart();
    useWishlistStore.getState().clearWishlist();

    router.push('/');
  }, [router]);


  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ _id: data._id, name: data.name, email: data.email, role: data.role, avatar: data.avatar });
        fetchUserData(token);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, [token]);

  // Helper: fetch with auth header
  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: any = { ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    return fetch(url, { ...options, headers });
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!token, isLoading, login, logout, refreshUser, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
