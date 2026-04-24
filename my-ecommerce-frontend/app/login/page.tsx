// app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

import { useNotification } from '@/src/context/NotificationContext';
import { useAuth } from '@/src/context/AuthContext';
import { useCartStore } from '@/src/store/cartStore';
import { useWishlistStore } from '@/src/store/wishlistStore';
import { API_URL } from '@/src/lib/api';

export default function LoginPage() {
  const { showNotification } = useNotification();
  const { login } = useAuth();
  const clearCart = useCartStore((s) => s.clearCart);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict email validation
    const emailStr = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(emailStr)) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    // Phone validation for registration
    if (!isLogin && (!formData.phone || formData.phone.length < 10)) {
      showNotification('Please enter a valid phone number.', 'error');
      return;
    }

    setLoading(true);

    const url = isLogin 
      ? `${API_URL}/users/login` 
      : `${API_URL}/users/register`;

    const body = isLogin 
      ? { email: emailStr, password: formData.password }
      : { ...formData, email: emailStr };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        if (!isLogin) {
          clearCart();
          clearWishlist();
        }

        login(data.token, { _id: data._id, name: data.name, email: data.email, role: data.role || 'user' });
        showNotification(isLogin ? 'Login successful! Redirecting...' : 'Account created successfully!', 'success');
        
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        showNotification(data.message || 'Something went wrong', 'error');
      }
    } catch (error) {
      showNotification('Network error. Make sure backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col">
      <nav className="sticky top-0 z-50 bg-brand-bg border-b border-brand-text/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-5 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold tracking-tighter">
            Slay by Humu<span className="text-brand-accent">.</span>
          </Link>
          <div className="flex gap-6 md:gap-10 text-[15px] font-sans font-medium items-center">
            <Link href="/" className="hover:text-brand-accent transition-colors hidden md:block">Home</Link>
            <Link href="/products" className="hover:text-brand-accent transition-colors">Shop</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center py-20 px-4 relative">

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-brand-panel p-10 md:p-14 rounded-3xl shadow-soft border border-brand-text/5 w-full max-w-lg"
        >
          <div className="text-center mb-10">
            <h2 className="text-brand-accent text-sm font-sans font-medium tracking-[0.2em] uppercase mb-4">
              Slay By Humu
            </h2>
            <h1 className="text-4xl md:text-5xl font-serif mb-2 tracking-tight">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-brand-muted font-sans font-light text-sm">
              {isLogin ? 'Access your luxury collection' : 'Join the Slay By Humu community'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 font-sans">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-2"
                  >
                    <label className="text-xs font-sans font-medium tracking-widest uppercase text-brand-muted">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-transparent border border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-base font-light rounded-none"
                      placeholder="e.g. Humu Salma"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-2"
                  >
                    <label className="text-xs font-sans font-medium tracking-widest uppercase text-brand-muted">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-transparent border border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-base font-light rounded-none"
                      placeholder="+233 24 000 0000"
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-sans font-medium tracking-widest uppercase text-brand-muted">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-transparent border border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-base font-light rounded-none"
                placeholder="humu@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-sans font-medium tracking-widest uppercase text-brand-muted">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-transparent border border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-base font-light rounded-none"
                placeholder="Min. 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full mt-10 shadow-soft tracking-wide disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="text-center mt-10 text-brand-muted font-sans font-light text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-accent font-medium hover:text-brand-accent/80 transition-colors ml-1"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
