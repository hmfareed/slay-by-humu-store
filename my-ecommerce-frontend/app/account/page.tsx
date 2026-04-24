'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, User, Package, MapPin, CreditCard, Settings, LogOut,
  ChevronRight, ShoppingBag, Heart, Moon, Sun, Bell, MessageCircle, Clock
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useNotification } from '@/src/context/NotificationContext';
import { useCartStore } from '@/src/store/cartStore';
import { useWishlistStore } from '@/src/store/wishlistStore';
import { useNotificationStore } from '@/src/store/notificationStore';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/ThemeToggle';
import { API_URL } from '@/src/lib/api';
import AIChat from '@/components/AIChat';

const API = API_URL;

export default function AccountPage() {
  const { user, token, isLoggedIn, isLoading, logout, refreshUser, orderCount } = useAuth();
  const { showNotification } = useNotification();
  const { theme, setTheme } = useTheme();
  const cartCount = useCartStore((s) => s.getTotalItems());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [mounted, setMounted] = useState(false);
  const notificationCount = useNotificationStore((s) => s.unreadCount);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [viewingPic, setViewingPic] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    { icon: Bell, label: 'Notifications', desc: 'Updates on your orders & account', href: '/account/notifications', badge: notificationCount || null },
    { icon: Package, label: 'My Orders', desc: 'Track & manage your orders', href: '/account/orders', badge: orderCount || null },
    { icon: MapPin, label: 'Delivery Address', desc: 'Manage shipping addresses', href: '/account/address', badge: null },
    { icon: CreditCard, label: 'Payment Methods', desc: 'Cards & mobile money', href: '/account/payment', badge: null },
    { icon: ShoppingBag, label: 'My Cart', desc: 'View your shopping bag', href: '/cart', badge: cartCount || null },
    { icon: Heart, label: 'Wishlist', desc: 'Your saved pieces', href: '/wishlist', badge: wishlistCount || null },
    { icon: Clock, label: 'Recently Viewed', desc: 'Pieces you looked at', href: '/account/recently-viewed', badge: null },
    { icon: Settings, label: 'Settings', desc: 'Dark mode, password & more', href: '/account/settings', badge: null },
  ];

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <header className="sticky top-0 z-50 bg-brand-bg border-b border-brand-text/5">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-5 flex items-center gap-3">
          <Link href="/" className="text-brand-muted hover:text-brand-text transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-serif font-bold tracking-tight">Account</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-brand-panel rounded-3xl p-6 md:p-8 border border-brand-text/5 shadow-soft mb-8">
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
                </button>

                {showAvatarMenu && (
                  <div className="absolute top-[70px] left-0 md:left-auto md:top-0 md:left-[70px] bg-brand-panel border border-brand-text/10 rounded-2xl shadow-xl w-40 overflow-hidden z-50 flex flex-col animate-in fade-in zoom-in duration-200">
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
        </div>

        {/* Quick Stats */}
        {isLoggedIn && (
          <div className="grid grid-cols-3 gap-3 mb-8">
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
          </div>
        )}

        {/* Menu List */}
        <div className="bg-brand-panel rounded-3xl border border-brand-text/5 overflow-hidden mb-6">
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
        </div>

        {/* Need Assistance Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 px-2">
            <h3 className="text-lg font-serif font-bold tracking-tight text-brand-text">Need Assistance?</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Live Chat Button */}
            <button 
              onClick={() => setIsAIChatOpen(true)}
              className="flex items-center justify-center gap-2 py-4 bg-[#FF8A00] hover:bg-[#E67A00] text-white rounded-2xl shadow-soft transition-colors group"
            >
              <div className="relative">
                <MessageCircle className="w-5 h-5 fill-white/20" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border-2 border-[#FF8A00]" />
              </div>
              <span className="font-sans font-bold text-[15px]">Live Chat</span>
            </button>
            
            {/* WhatsApp Button */}
            <Link 
              href="https://wa.me/233502002904"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-4 bg-[#25D366] hover:bg-[#20bd5c] text-white rounded-2xl shadow-soft transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span className="font-sans font-bold text-[16px] tracking-tight">WhatsApp</span>
          </Link>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="bg-brand-panel rounded-2xl border border-brand-text/5 px-6 py-4 flex items-center justify-between mb-6">
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
      </div>

      {/* Logout */}
      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-2xl px-6 py-4 flex items-center gap-4 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <span className="font-sans font-medium text-sm text-red-500">Sign Out</span>
        </button>
      )}
      </div>

      {/* AIChat Component */}
      <AIChat 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)} 
        userName={user?.name}
        authToken={token}
        cartItems={useCartStore.getState().items}
      />

      {/* Picture Viewer Modal */}
      {viewingPic && user?.avatar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200" onClick={() => setViewingPic(false)}>
          <div className="relative max-w-lg w-full aspect-square rounded-3xl overflow-hidden bg-brand-bg shadow-2xl scale-in-95 duration-200">
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            <button className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center ">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
