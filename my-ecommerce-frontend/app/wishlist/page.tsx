'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, ArrowLeft, Trash2, Package } from 'lucide-react';
import { useWishlistStore } from '@/src/store/wishlistStore';
import { useCartStore } from '@/src/store/cartStore';
import { useNotification } from '@/src/context/NotificationContext';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addToCart = useCartStore((s) => s.addItem);
  const { showNotification } = useNotification();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleMoveToCart = async (product: any) => {
    await addToCart(product);
    removeItem(product._id);
    showNotification(`${product.name} moved to your bag`, 'success');
  };

  const handleRemove = (productId: string, name: string) => {
    removeItem(productId);
    showNotification(`${name} removed from wishlist`, 'info');
  };

  const handleMoveAllToCart = async () => {
    for (const item of items) {
      await addToCart(item);
    }
    clearWishlist();
    showNotification(`${items.length} pieces moved to your bag`, 'success');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-xl border-b border-brand-text/5">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-brand-muted hover:text-brand-text transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-serif font-bold tracking-tight">
              Wishlist
              {items.length > 0 && (
                <span className="text-brand-muted font-sans text-sm font-normal ml-2">({items.length})</span>
              )}
            </h1>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleMoveAllToCart}
              className="text-brand-accent text-xs font-sans font-semibold uppercase tracking-widest hover:text-brand-accent-hover transition-colors"
            >
              Move All to Bag
            </button>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Empty State */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            {/* Illustration */}
            <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-brand-panel border border-brand-text/5 flex items-center justify-center">
              <Heart className="w-12 h-12 text-brand-muted" strokeWidth={1} />
            </div>
            <h2 className="text-2xl font-serif tracking-tight mb-3">Your wishlist is empty</h2>
            <p className="text-brand-muted font-sans font-light text-sm mb-8 max-w-sm mx-auto">
              Save your favorite pieces here to find them later. Tap the heart icon on any product to add it.
            </p>
            <Link
              href="/categories"
              className="btn-gold inline-flex items-center gap-2 px-10 py-3.5 text-sm shadow-soft"
            >
              <Package className="w-4 h-4" />
              Explore Collection
            </Link>
          </motion.div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {items.map((product, idx) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-brand-panel border border-brand-text/5 mb-3">
                    <Link href={`/products/${product._id}`}>
                      <img
                        src={product.images?.[0] || ''}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-[1s] group-hover:scale-105"
                      />
                    </Link>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(product._id, product.name)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-brand-panel/80 backdrop-blur-sm flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </button>

                    {/* Move to Cart button */}
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="absolute bottom-3 left-3 right-3 bg-brand-accent text-white text-[10px] font-sans font-semibold uppercase tracking-[0.15em] py-2.5 rounded-full flex items-center justify-center gap-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      Move to Bag
                    </button>
                  </div>

                  <div className="text-center font-sans px-1">
                    <h3 className="font-medium text-sm tracking-tight text-brand-text truncate mb-1">
                      {product.name}
                    </h3>
                    <p className="text-brand-accent font-semibold text-sm">₵{product.price.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
