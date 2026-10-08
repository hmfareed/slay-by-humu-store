'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag, Heart, UserCircle, X } from 'lucide-react';
import { useCartStore } from '@/src/store/cartStore';
import { useWishlistStore } from '@/src/store/wishlistStore';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/cart', label: 'Cart', icon: ShoppingBag, badge: 'cart' as const },
  { href: '/wishlist', label: 'Wishlist', icon: Heart, badge: 'wishlist' as const },
  { href: '/account', label: 'Account', icon: UserCircle },
];

export default function SlideOutNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const cartCount = useCartStore((s) => s.getTotalItems());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  useEffect(() => {
    setMounted(true);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('open-nav-menu', handleOpen);
    window.addEventListener('close-nav-menu', handleClose);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-nav-menu', handleOpen);
      window.removeEventListener('close-nav-menu', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close automatically on route navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleClose = () => setIsOpen(false);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] hidden md:flex justify-start">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative h-full w-full max-w-[280px] sm:max-w-xs bg-brand-panel shadow-2xl flex flex-col border-r border-brand-text/5 z-10 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-text/5">
          <Link
            href="/"
            onClick={handleClose}
            className="text-2xl font-serif font-bold tracking-tighter text-brand-accent block"
          >
            SLAY BY HUMU
          </Link>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-brand-text/5 text-brand-text hover:text-brand-accent transition-colors"
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation list matching BottomNav */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {tabs.map((tab) => {
            const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            const badgeCount =
              tab.badge === 'cart'
                ? cartCount
                : tab.badge === 'wishlist'
                ? wishlistCount
                : 0;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={handleClose}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-sans font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-accent/10 text-brand-accent font-semibold'
                    : 'text-brand-text hover:bg-brand-text/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? 'text-brand-accent' : 'text-brand-muted group-hover:text-brand-text'
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.75}
                    fill={isActive && tab.badge === 'wishlist' ? 'currentColor' : 'none'}
                  />
                  <span>{tab.label}</span>
                </div>

                {/* Badge if available */}
                {badgeCount > 0 && (
                  <span className="bg-brand-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
