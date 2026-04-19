'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag, Heart, UserCircle } from 'lucide-react';
import { useCartStore } from '@/src/store/cartStore';
import { useWishlistStore } from '@/src/store/wishlistStore';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/cart', label: 'Cart', icon: ShoppingBag, badge: 'cart' as const },
  { href: '/wishlist', label: 'Wishlist', icon: Heart, badge: 'wishlist' as const },
  { href: '/account', label: 'Account', icon: UserCircle },
];

export default function BottomNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.getTotalItems());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Hide on desktop
  // Hide on certain pages like product detail or checkout
  const hiddenPaths = ['/checkout', '/admin'];
  const shouldHide = hiddenPaths.some((p) => pathname.startsWith(p));
  if (shouldHide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[80] md:hidden bg-brand-panel/95 backdrop-blur-xl border-t border-brand-text/5 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          const badgeCount = tab.badge === 'cart' ? cartCount : tab.badge === 'wishlist' ? wishlistCount : 0;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1 group"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? 'text-brand-accent' : 'text-brand-muted group-hover:text-brand-text'
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.5}
                  fill={isActive && tab.badge === 'wishlist' ? 'currentColor' : 'none'}
                />
                {/* Badge */}
                {mounted && badgeCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 bg-brand-accent text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </motion.span>
                )}
              </div>

              <span
                className={`text-[10px] font-sans font-medium transition-colors duration-200 ${
                  isActive ? 'text-brand-accent' : 'text-brand-muted'
                }`}
              >
                {tab.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-0.5 w-1 h-1 rounded-full bg-brand-accent"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
