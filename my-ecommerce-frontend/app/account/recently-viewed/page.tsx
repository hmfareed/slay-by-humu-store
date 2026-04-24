'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/src/context/AuthContext';

interface RecentProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function RecentlyViewedPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const key = `recent_products_${user ? user._id : 'guest'}`;
    const recent = JSON.parse(localStorage.getItem(key) || '[]');
    setProducts(recent);
  }, []);

  const handleClear = () => {
    const key = `recent_products_${user ? user._id : 'guest'}`;
    localStorage.removeItem(key);
    setProducts([]);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <header className="sticky top-0 z-50 bg-brand-bg border-b border-brand-text/5">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/account" className="text-brand-muted hover:text-brand-text transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-serif font-bold tracking-tight">Recently Viewed</h1>
          </div>
          {products.length > 0 && (
            <button 
              onClick={handleClear}
              className="text-sm font-sans font-medium text-brand-muted hover:text-brand-accent transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-20 bg-brand-panel rounded-3xl border border-brand-text/5">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-text/5 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-brand-muted" />
            </div>
            <h2 className="text-xl font-serif font-bold tracking-tight mb-2 text-brand-text">No history yet</h2>
            <p className="text-brand-muted text-sm font-sans mb-6">Looks like you haven't browsed any products recently.</p>
            <Link href="/products" className="btn-gold inline-flex items-center gap-2 px-8 py-3 text-sm shadow-soft">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/products/${product._id}`} className="group block bg-brand-panel rounded-2xl border border-brand-text/5 overflow-hidden hover:border-brand-accent/30 transition-colors">
                  <div className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <ShoppingBag size={32} opacity={0.5} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-brand-muted uppercase tracking-widest mb-1 truncate">{product.category}</p>
                    <h3 className="text-sm font-bold font-sans text-brand-text truncate mb-1">{product.name}</h3>
                    <p className="text-sm font-bold text-brand-accent">₵{product.price.toLocaleString()}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
