'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export interface FlyItem {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  imageUrl?: string;
}

/**
 * Hook to listen for cart impact bumps and provide an active pulse state.
 */
export function useCartBump() {
  const [bump, setBump] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleBump = () => {
      setBump(true);
      clearTimeout(timer);
      timer = setTimeout(() => setBump(false), 400);
    };

    window.addEventListener('cart-icon-bump', handleBump);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('cart-icon-bump', handleBump);
    };
  }, []);

  return bump;
}

/**
 * Triggers the fly-to-cart animation from a click event, element, or coordinates.
 */
export function triggerFlyToCart(
  source: React.MouseEvent | MouseEvent | HTMLElement | DOMRect | { x: number; y: number },
  imageUrl?: string
) {
  if (typeof window === 'undefined') return;

  // Check prefers-reduced-motion: if active, bump the cart icon directly
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.dispatchEvent(new CustomEvent('cart-icon-bump'));
    return;
  }

  let startX = 0;
  let startY = 0;

  if ('clientX' in source && 'clientY' in source) {
    const mouseEvt = source as MouseEvent;
    if (mouseEvt.currentTarget && mouseEvt.currentTarget instanceof HTMLElement) {
      const rect = mouseEvt.currentTarget.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    } else {
      startX = mouseEvt.clientX;
      startY = mouseEvt.clientY;
    }
  } else if ('getBoundingClientRect' in source && typeof source.getBoundingClientRect === 'function') {
    const rect = source.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
  } else if ('left' in source && 'top' in source && 'width' in source) {
    const rect = source as DOMRect;
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
  } else if ('x' in source && 'y' in source) {
    startX = source.x;
    startY = source.y;
  }

  window.dispatchEvent(
    new CustomEvent('cart-fly-start', {
      detail: { startX, startY, imageUrl },
    })
  );
}

export default function CartFlyAnimation() {
  const [items, setItems] = useState<FlyItem[]>([]);

  const handleStart = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<{ startX: number; startY: number; imageUrl?: string }>;
    const { startX, startY, imageUrl } = customEvent.detail || {};

    // Find the active/visible cart target on the screen
    let targetX = typeof window !== 'undefined' ? window.innerWidth - 48 : 0;
    let targetY = 40;

    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-cart-target]'));
    const visibleTarget = targets.find((el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth
      );
    }) || targets[0];

    if (visibleTarget) {
      const rect = visibleTarget.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    const newItem: FlyItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      startX: startX || window.innerWidth / 2,
      startY: startY || window.innerHeight / 2,
      targetX,
      targetY,
      imageUrl,
    };

    setItems((prev) => [...prev, newItem]);
  }, []);

  useEffect(() => {
    window.addEventListener('cart-fly-start', handleStart);
    return () => {
      window.removeEventListener('cart-fly-start', handleStart);
    };
  }, [handleStart]);

  const handleComplete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    window.dispatchEvent(new CustomEvent('cart-icon-bump'));
  };

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <AnimatePresence>
        {items.map((item) => {
          const size = 56;
          const half = size / 2;
          // Calculate an arc midpoint for a natural toss curve into the cart
          const midX = (item.startX + item.targetX) / 2;
          const midY = Math.min(item.startY, item.targetY) - 60;

          return (
            <motion.div
              key={item.id}
              initial={{
                x: item.startX - half,
                y: item.startY - half,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: [item.startX - half, midX - half, item.targetX - half * 0.4],
                y: [item.startY - half, midY - half, item.targetY - half * 0.4],
                scale: [1, 0.85, 0.25],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 0.55,
                ease: [0.23, 1, 0.32, 1], // Strong ease-out as prescribed
                times: [0, 0.5, 1],
              }}
              onAnimationComplete={() => handleComplete(item.id)}
              className="absolute left-0 top-0 w-14 h-14 rounded-2xl bg-brand-panel/90 border-2 border-brand-accent/50 shadow-2xl backdrop-blur-md overflow-hidden flex items-center justify-center p-1"
              style={{ willChange: 'transform, opacity' }}
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt="Item flying to bag"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    // Fallback to ShoppingBag icon if image fails
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <ShoppingBag className="w-6 h-6 text-brand-accent animate-pulse" />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
