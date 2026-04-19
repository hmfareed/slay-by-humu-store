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
    // Block common typos
    if (emailStr.endsWith('@gmail.co') || emailStr.endsWith('@yahoo.co') || emailStr.endsWith('@hotmail.co')) {
      showNotification('Invalid email domain. Did you mean .com?', 'error');
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
        // Only wipe cart/wishlist on fresh registration so we don't accidentally wipe a guest cart before login
        if (!isLogin) {
          clearCart();
          clearWishlist();
        }

        // Sync with global auth context
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
      {/* Luxury Navbar */}
      <nav className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-xl border-b border-brand-text/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-5 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold tracking-tighter">
            Slay by Humu
            <span className="text-brand-accent">.</span>
          </Link>
          
          <div className="flex gap-6 md:gap-10 text-[15px] font-sans font-medium tracking-wide items-center">
            <Link href="/" className="hover:text-brand-accent transition-colors hidden md:block">Home</Link>
            <Link href="/products" className="hover:text-brand-accent transition-colors">Shop</Link>
            <Link href="/cart" className="hover:text-brand-accent transition-colors hidden md:block">Cart</Link>
            <Link href="/login" className="text-brand-accent hidden md:block">Account</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center py-20 px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-brand-accent/5 rounded-full blur-[150px] pointer-events-none -z-10" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-brand-panel p-10 md:p-14 rounded-3xl shadow-soft border border-brand-text/5 w-full max-w-lg"
        >
          <h1 className="text-4xl font-bold text-center mb-10 tracking-tight">
            {isLogin ? 'Welcome Back.' : 'Join the Collection.'}
          </h1>

          <div className="flex justify-center gap-4 mb-10 p-1 bg-brand-text/5 rounded-full font-sans">
            <button
              onClick={() => { setIsLogin(true); }}
              className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${isLogin ? 'bg-brand-panel shadow-soft text-brand-text' : 'text-brand-muted hover:text-brand-text'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); }}
              className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${!isLogin ? 'bg-brand-panel shadow-soft text-brand-text' : 'text-brand-muted hover:text-brand-text'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 font-sans">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group relative"
                >
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="peer w-full px-0 py-4 bg-transparent border-b-2 border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-lg font-light placeholder-transparent"
                    placeholder="Full Name"
                  />
                  <label className="absolute left-0 top-4 text-brand-muted text-lg transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-brand-accent peer-focus:font-semibold peer-valid:-top-4 peer-valid:text-xs peer-valid:text-brand-accent peer-valid:font-semibold cursor-text">
                    Full Name
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="group relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="peer w-full px-0 py-4 bg-transparent border-b-2 border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-lg font-light placeholder-transparent"
                placeholder="Email Address"
              />
              <label className="absolute left-0 top-4 text-brand-muted text-lg transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-brand-accent peer-focus:font-semibold peer-valid:-top-4 peer-valid:text-xs peer-valid:text-brand-accent peer-valid:font-semibold cursor-text">
                Email Address
              </label>
            </div>

            <div className="group relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="peer w-full px-0 py-4 bg-transparent border-b-2 border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-lg font-light placeholder-transparent"
                placeholder="Password"
              />
              <label className="absolute left-0 top-4 text-brand-muted text-lg transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-brand-accent peer-focus:font-semibold peer-valid:-top-4 peer-valid:text-xs peer-valid:text-brand-accent peer-valid:font-semibold cursor-text">
                Password
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full mt-10 shadow-soft tracking-wide disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>


          <p className="text-center mt-10 text-brand-muted font-sans font-light text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); }}
              className="text-brand-text font-medium hover:text-brand-accent transition-colors ml-1"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}