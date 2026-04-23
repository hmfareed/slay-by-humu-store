'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/src/store/cartStore';
import { useWishlistStore } from '@/src/store/wishlistStore';
import { useNotificationStore } from '@/src/store/notificationStore';
import { useNotification } from '@/src/context/NotificationContext';
import { API_URL } from '@/src/lib/api';
import { socket } from '@/src/lib/socket';

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
  orderCount: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('token');
    return null;
  });

  const [user, setUser] = useState<UserInfo | null>(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          return { _id: payload.id, name: payload.name || '', email: payload.email || '', role: payload.role || 'user', avatar: payload.avatar };
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(0);
  const router = useRouter();
  const { showNotification } = useNotification();

  const fetchUserData = useCallback(async (activeToken: string) => {
    try {
      const headers = { Authorization: `Bearer ${activeToken}` };
      
      const [wlRes, cartRes, notifRes, ordersRes] = await Promise.all([
        fetch(`${API}/wishlist`, { headers }),
        fetch(`${API}/cart`, { headers }),
        fetch(`${API}/notifications`, { headers }),
        fetch(`${API}/orders`, { headers })
      ]);

      if (wlRes.ok) {
        const wlData = await wlRes.json();
        const formattedWishlist = wlData.items.map((i: any) => i.product);
        useWishlistStore.getState().setItems(formattedWishlist);
      }
      
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        useCartStore.getState().setItems(cartData.items || []);
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        const unread = notifData.filter((n: { isRead: boolean }) => !n.isRead).length;
        useNotificationStore.getState().setUnreadCount(unread);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrderCount(ordersData.length);
      }
    } catch (err) {
      console.error('Failed to fetch secured data', err);
    }
  }, []);

  // Init data after mount
  useEffect(() => {
    if (token) {
      fetchUserData(token);
    }
    setIsLoading(false);
  }, [token, fetchUserData]);

  // Setup WebSocket connection and listeners
  useEffect(() => {
    if (token && user?._id) {
      console.log('🔄 Initializing WebSocket connection...');
      socket.connect();
      
      socket.on('connect', () => {
        console.log('✅ WebSocket successfully connected! Socket ID:', socket.id);
        socket.emit('join', user._id);
      });

      socket.on('connect_error', (err) => {
        console.error('❌ WebSocket connection error:', err.message);
      });

      const handleNewNotification = (notification: { title: string }) => {
        console.log('📬 New notification received via WebSocket:', notification);
        showNotification(notification.title, 'info');
        useNotificationStore.getState().incrementUnread();
        
        // Dispatch custom event so the notifications page can listen and append instantly
        window.dispatchEvent(new CustomEvent('new_notification', { detail: notification }));
      };

      socket.on('new_notification', handleNewNotification);

      return () => {
        console.log('🔌 Disconnecting WebSocket...');
        socket.off('connect');
        socket.off('connect_error');
        socket.off('new_notification', handleNewNotification);
        socket.disconnect();
      };
    }
  }, [token, user?._id, showNotification]);

  const login = useCallback((newToken: string, userInfo: UserInfo) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userInfo);
    fetchUserData(newToken);
  }, [fetchUserData]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setOrderCount(0);
    
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
  }, [token, fetchUserData]);

  // Helper: fetch with auth header
  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    return fetch(url, { ...options, headers });
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!token, isLoading, login, logout, refreshUser, authFetch, orderCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
