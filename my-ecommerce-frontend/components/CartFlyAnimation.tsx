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
      // Keep bump active for 650ms to match the juicy landing bounce
      timer = setTimeout(() => setBump(false), 650);
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
  source?: React.MouseEvent | MouseEvent | HTMLElement | DOMRect | { x: number; y: number } | null,
  imageUrl?: string
) {
  if (typeof window === 'undefined') return;

  // Check prefers-reduced-motion: if active, bump the cart icon directly
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.dispatchEvent(new CustomEvent('cart-icon-bump'));
    return;
  }

  let startX = window.innerWidth / 2;
  let startY = window.innerHeight / 2;

  if (source) {
    if ('currentTarget' in source && source.currentTarget instanceof HTMLElement) {
      const rect = source.currentTarget.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    } else if ('target' in source && source.target instanceof HTMLElement) {
      const rect = source.target.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    } else if ('clientX' in source && 'clientY' in source) {
      const mouseEvt = source as MouseEvent;
      startX = mouseEvt.clientX;
      startY = mouseEvt.clientY;
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
    // Respect reduced motion if event was dispatched directly
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.dispatchEvent(new CustomEvent('cart-icon-bump'));
      return;
    }

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
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0 &&
        window.getComputedStyle(el).display !== 'none' &&
        window.getComputedStyle(el).visibility !== 'hidden'
      );
    });

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
          const dy = item.startY - item.targetY;
          const dx = item.targetX - item.startX;

          // Safe trajectory points strictly inside the viewport
          const point1X = item.startX + dx * 0.45;
          const point1Y = item.targetY + dy * 0.35;

          const point2X = item.startX + dx * 0.85;
          const point2Y = item.targetY + dy * 0.1;

          const point3X = item.startX + dx * 0.96;
          const point3Y = item.targetY + 4;

          return (
            <motion.div
              key={item.id}
              initial={{
                x: item.startX,
                y: item.startY,
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: [item.startX, point1X, point2X, point3X, item.targetX],
                y: [item.startY, point1Y, point2Y, point3Y, item.targetY],
                scale: [1, 0.88, 0.58, 0.35, 0.08],
                opacity: [1, 1, 1, 0.9, 0],
                rotate: [0, -8, 6, -3, 0],
              }}
              transition={{
                duration: 0.92, // Slowed down so user can follow with eyes
                ease: [0.25, 0.1, 0.25, 1],
                times: [0, 0.4, 0.75, 0.92, 1],
              }}
              onAnimationComplete={() => handleComplete(item.id)}
              className="absolute left-0 top-0 w-14 h-14 rounded-2xl bg-brand-panel/95 border-2 border-brand-accent shadow-2xl backdrop-blur-md overflow-hidden flex items-center justify-center p-1"
              style={{
                translateX: '-50%',
                translateY: '-50%',
                willChange: 'transform, opacity',
              }}
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt="Item entering cart"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
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
