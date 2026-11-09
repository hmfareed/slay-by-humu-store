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
      // Keep bump active for 550ms to match the energetic landing bounce
      timer = setTimeout(() => setBump(false), 550);
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

/**
 * Calculates a mathematically continuous cubic Bézier flight trajectory.
 * Prevents abrupt velocity jumps, providing a silky smooth physical arc.
 */
function getTrajectory(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  steps = 14
) {
  const isFlyingDown = targetY > startY;

  // Horizontal cubic control points: gentle acceleration then deceleration
  const p0X = startX;
  const p1X = startX + (targetX - startX) * 0.25;
  const p2X = startX + (targetX - startX) * 0.75;
  const p3X = targetX;

  // Vertical cubic control points:
  const p0Y = startY;
  // If flying down to bottom nav: loft upwards by ~30-40px before curving down into bottom nav
  // If flying up to header: energetic launch upwards, cushioning into top header
  const p1Y = isFlyingDown
    ? Math.max(25, startY - 110)
    : startY - (startY - targetY) * 0.6;

  const p2Y = isFlyingDown
    ? startY + (targetY - startY) * 0.45
    : Math.max(15, targetY - 25);

  const p3Y = targetY;

  const xs: number[] = [];
  const ys: number[] = [];
  const scales: number[] = [];
  const opacities: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const u3 = u * u * u;
    const u2t = 3 * u * u * t;
    const ut2 = 3 * u * t * t;
    const t3 = t * t * t;

    const x = u3 * p0X + u2t * p1X + ut2 * p2X + t3 * p3X;
    const y = u3 * p0Y + u2t * p1Y + ut2 * p2Y + t3 * p3Y;

    // Smooth continuous shrink from full size (1.0) down to miniature (0.12)
    const scale = 1 - t * 0.88;

    // Retain full visibility until entering the cart, then cleanly dissolve
    let opacity = 1;
    if (t > 0.75) {
      opacity = 1 - (t - 0.75) / 0.25;
    }

    xs.push(Math.round(x));
    ys.push(Math.round(y));
    scales.push(Number(scale.toFixed(2)));
    opacities.push(Number(opacity.toFixed(2)));
  }

  return { xs, ys, scales, opacities };
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
          const { xs, ys, scales, opacities } = getTrajectory(
            item.startX,
            item.startY,
            item.targetX,
            item.targetY
          );

          return (
            <motion.div
              key={item.id}
              initial={{
                x: item.startX,
                y: item.startY,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: xs,
                y: ys,
                scale: scales,
                opacity: opacities,
              }}
              transition={{
                duration: 0.85, // Balanced, natural, and silky smooth
                ease: 'linear', // Evenly sampled along continuous cubic Bézier curve
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
