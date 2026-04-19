'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/src/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNotification } from '@/src/context/NotificationContext';
import { API_URL } from '@/src/lib/api';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const setItems = useCartStore((s) => s.setItems);
  const { showNotification } = useNotification();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Sync from backend if logged in and local cart is empty
    const sync = async () => {
      const token = localStorage.getItem('token');
      if (token && items.length === 0) {
        try {
          const res = await fetch(`${API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.items?.length > 0) setItems(data.items);
          }
        } catch (e) {
          console.error('Error syncing cart:', e);
        }
      }
      setLoading(false);
    };
    sync();
  }, []);

  const handleRemove = async (productId: string, name: string) => {
    await removeItem(productId);
    showNotification(`${name} removed from bag`, 'info');
  };

  const handleIncrease = async (product: any) => {
    await addItem(product);
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="w-8 h-8 border-2 border-brand-text/10 border-t-brand-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-xl border-b border-brand-text/5">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-brand-muted hover:text-brand-text transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-serif font-bold tracking-tight">
              Your Bag
              {totalItems > 0 && (
                <span className="text-brand-muted font-sans text-sm font-normal ml-2">({totalItems})</span>
              )}
            </h1>
          </div>
          {items.length > 0 && (
            <Link
              href="/products"
              className="text-brand-accent text-xs font-sans font-semibold uppercase tracking-widest"
            >
              + Add More
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
        {/* Empty State */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-brand-panel border border-brand-text/5 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-brand-muted" strokeWidth={1} />
            </div>
            <h2 className="text-2xl font-serif tracking-tight mb-3">Your bag is empty</h2>
            <p className="text-brand-muted font-sans font-light text-sm mb-8 max-w-sm mx-auto">
              Looks like you haven't added any pieces yet. Explore our collection to find your perfect look.
            </p>
            <Link
              href="/categories"
              className="btn-gold inline-flex items-center gap-2 px-10 py-3.5 text-sm shadow-soft"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-8">
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.product._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-4 bg-brand-panel p-4 rounded-2xl border border-brand-text/5 shadow-sm"
                  >
                    {/* Product Image */}
                    <Link href={`/products/${item.product._id}`} className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-brand-bg">
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-muted text-xs">No img</div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                      <div>
                        <h3 className="font-sans font-semibold text-sm text-brand-text truncate pr-6">
                          {item.product.name}
                        </h3>
                        <p className="text-brand-muted text-xs font-sans capitalize mt-0.5">
                          {item.product.category}
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 bg-brand-bg rounded-lg border border-brand-text/10">
                          <button
                            onClick={() => {
                              if (item.quantity <= 1) {
                                handleRemove(item.product._id, item.product.name);
                              }
                              // For decrement > 1, we'd need a decrementItem function.
                              // For now, quantity of 1 removes the item.
                            }}
                            className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors"
                          >
                            {item.quantity <= 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                          </button>
                          <span className="w-8 text-center text-sm font-sans font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleIncrease(item.product)}
                            className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-accent transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <p className="font-sans font-semibold text-base text-brand-text">
                          ₵{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ─── Order Summary ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-brand-panel rounded-3xl p-6 border border-brand-text/5 shadow-soft"
            >
              <h3 className="text-lg font-serif font-bold tracking-tight mb-5">Order Summary</h3>

              <div className="space-y-3 text-sm font-sans mb-5">
                <div className="flex justify-between text-brand-muted">
                  <span>Subtotal ({totalItems} pieces)</span>
                  <span>₵{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Shipping</span>
                  <span className="text-brand-accent italic font-medium">Complimentary</span>
                </div>
              </div>

              <div className="border-t border-brand-text/5 pt-4 mb-6">
                <div className="flex justify-between font-sans font-bold text-xl">
                  <span>Total</span>
                  <span>₵{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="btn-gold w-full py-4 text-sm shadow-soft"
              >
                Proceed to Checkout
              </Link>

              <p className="text-center text-[10px] text-brand-muted mt-4 font-sans tracking-widest uppercase">
                Taxes calculated at checkout
              </p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}