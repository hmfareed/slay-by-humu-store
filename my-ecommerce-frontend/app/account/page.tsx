'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Package, MapPin, CreditCard, Settings, LogOut,
  ChevronRight, ShoppingBag, Heart, Moon, Sun
} from 'lucide-react';
import { useAuth } from 'src/context/AuthContext';
import { useNotification } from 'src/context/NotificationContext';
import { useCartStore } from 'src/store/cartStore';
import { useWishlistStore } from 'src/store/wishlistStore';
import { useTheme } from 'next-themes';
import { ThemeToggle } from 'components/ThemeToggle';

const API = 'http://localhost:5000/api';

export default function AccountPage() {
  const { user, token, isLoggedIn, isLoading, logout, refreshUser } = useAuth();
  const { showNotification } = useNotification();
  const { theme, setTheme } = useTheme();
  const cartCount = useCartStore((s) => s.getTotalItems());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [mounted, setMounted] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [viewingPic, setViewingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    if (token) fetchOrderCount();
  }, [token]);

  const fetchOrderCount = async () => {
    try {
      const res = await fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setOrderCount(data.length); }
    } catch { /* silent */ }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!token) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(`${API}/users/me/avatar`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        showNotification('Profile picture updated!', 'success');
        refreshUser();
      } else {
        const err = await res.json();
        showNotification(err.message || 'Failed to upload picture', 'error');
      }
    } catch (err) {
      showNotification('Network error uploading picture', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    logout();
    showNotification('Successfully signed out', 'info');
  };

  if (!mounted) return null;

  const menuItems = [
    { icon: Package, label: 'My Orders', desc: 'Track & manage your orders', href: '/account/orders', badge: orderCount || null },
    { icon: MapPin, label: 'Delivery Address', desc: 'Manage shipping addresses', href: '/account/address', badge: null },
    { icon: CreditCard, label: 'Payment Methods', desc: 'Cards & mobile money', href: '/account/payment', badge: null },
    { icon: ShoppingBag, label: 'My Cart', desc: 'View your shopping bag', href: '/cart', badge: cartCount || null },
    { icon: Heart, label: 'Wishlist', desc: 'Your saved pieces', href: '/wishlist', badge: wishlistCount || null },
    { icon: Settings, label: 'Settings', desc: 'Dark mode, password & more', href: '/account/settings', badge: null },
  ];

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <header className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-xl border-b border-brand-text/5">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-5 flex items-center gap-3">
          <Link href="/" className="text-brand-muted hover:text-brand-text transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-serif font-bold tracking-tight">Account</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-brand-panel rounded-3xl p-6 md:p-8 border border-brand-text/5 shadow-soft mb-8">
          {isLoggedIn && user ? (
            <div className="flex items-center gap-5">
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    handleAvatarChange(e);
                    setShowAvatarMenu(false);
                  }} 
                  className="hidden"
                  ref={fileInputRef}
                  disabled={uploadingAvatar}
                />
                
                <button 
                  onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                  className={`relative w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center flex-shrink-0 transition-all ${uploadingAvatar ? 'border-brand-text/20 bg-brand-text/5' : 'bg-brand-accent/10 border-brand-accent/30 hover:border-brand-accent/60 shadow-sm'}`}
                >
                  {uploadingAvatar ? (
                    <div className="w-5 h-5 border-2 border-brand-text/20 border-t-brand-accent rounded-full animate-spin" />
                  ) : user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-serif font-bold text-brand-accent">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-brand-panel shadow-sm border border-brand-text/10 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-[10px]">📷</span>
                  </div>
                </button>

                {showAvatarMenu && (
                  <div className="absolute top-[70px] left-0 md:left-auto md:top-0 md:left-[70px] bg-brand-panel border border-brand-text/10 rounded-2xl shadow-xl w-40 overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-left flex flex-col">
                    <button 
                      onClick={() => {
                        setViewingPic(true);
                        setShowAvatarMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-sans font-medium hover:bg-brand-text/5 transition-colors"
                    >
                      View Picture
                    </button>
                    <button 
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAvatarMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-sans font-medium hover:bg-brand-text/5 transition-colors text-brand-accent"
                    >
                      Upload New
                    </button>
                    {user.avatar && (
                      <button 
                        onClick={() => {
                          // Could implement delete logic if needed
                          setShowAvatarMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-sans font-medium hover:bg-red-500/10 text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-serif font-bold tracking-tight truncate">{user.name}</h2>
                <p className="text-brand-muted text-sm font-sans truncate">{user.email}</p>
                <span className="inline-block mt-2 text-[10px] font-sans font-semibold uppercase tracking-widest text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full">
                  {user.role === 'admin' ? 'Admin' : 'Member'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-brand-text/5 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-brand-muted" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-serif font-bold tracking-tight mb-2">Welcome to Slay by Humu</h2>
              <p className="text-brand-muted text-sm font-sans mb-6">Sign in to access your orders & preferences</p>
              <Link href="/login" className="btn-gold inline-flex items-center gap-2 px-10 py-3 text-sm shadow-soft">Sign In</Link>
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        {isLoggedIn && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-8">
            <Link href="/cart" className="bg-brand-panel p-4 rounded-2xl border border-brand-text/5 text-center hover:border-brand-accent/20 transition-colors">
              <ShoppingBag className="w-5 h-5 mx-auto mb-2 text-brand-accent" />
              <span className="block text-lg font-bold font-sans">{cartCount}</span>
              <span className="text-[10px] text-brand-muted font-sans uppercase tracking-widest">In Bag</span>
            </Link>
            <Link href="/wishlist" className="bg-brand-panel p-4 rounded-2xl border border-brand-text/5 text-center hover:border-brand-accent/20 transition-colors">
              <Heart className="w-5 h-5 mx-auto mb-2 text-brand-accent" />
              <span className="block text-lg font-bold font-sans">{wishlistCount}</span>
              <span className="text-[10px] text-brand-muted font-sans uppercase tracking-widest">Saved</span>
            </Link>
            <Link href="/account/orders" className="bg-brand-panel p-4 rounded-2xl border border-brand-text/5 text-center hover:border-brand-accent/20 transition-colors">
              <Package className="w-5 h-5 mx-auto mb-2 text-brand-accent" />
              <span className="block text-lg font-bold font-sans">{orderCount}</span>
              <span className="text-[10px] text-brand-muted font-sans uppercase tracking-widest">Orders</span>
            </Link>
          </motion.div>
        )}

        {/* Menu List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-brand-panel rounded-3xl border border-brand-text/5 overflow-hidden mb-6">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-brand-text/[0.02] transition-colors ${idx < menuItems.length - 1 ? 'border-b border-brand-text/5' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-medium text-sm">{item.label}</p>
                  <p className="text-brand-muted text-xs font-sans">{item.desc}</p>
                </div>
                {item.badge !== null && (
                  <span className="bg-brand-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{item.badge}</span>
                )}
                <ChevronRight className="w-4 h-4 text-brand-muted flex-shrink-0" />
              </Link>
            );
          })}
        </motion.div>

        {/* Theme Toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-brand-panel rounded-2xl border border-brand-text/5 px-6 py-4 flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-accent" /> : <Sun className="w-5 h-5 text-brand-accent" />}
            </div>
            <div>
              <p className="font-sans font-medium text-sm">Dark Mode</p>
              <p className="text-brand-muted text-xs font-sans">Toggle appearance</p>
            </div>
          </div>
          <ThemeToggle />
        </motion.div>

        {/* Logout */}
        {isLoggedIn && (
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            onClick={handleLogout}
            className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-2xl px-6 py-4 flex items-center gap-4 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <span className="font-sans font-medium text-sm text-red-500">Sign Out</span>
          </motion.button>
        )}
      </div>

      {/* Picture Viewer Modal */}
      {viewingPic && user?.avatar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200" onClick={() => setViewingPic(false)}>
          <div className="relative max-w-lg w-full aspect-square rounded-3xl overflow-hidden bg-brand-bg shadow-2xl scale-in-95 duration-200">
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            <button className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
