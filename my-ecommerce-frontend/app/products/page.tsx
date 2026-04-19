// app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShoppingBag, User, Menu } from 'lucide-react';
import { useCartStore } from '@/src/store/cartStore';
import { API_URL } from '@/src/lib/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const cartItemsCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-text/10 border-t-brand-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-text font-sans">
        <p>Error: {error}</p>
      </div>
    );
  }

  const openCart = () => window.dispatchEvent(new Event('open-mini-cart'));

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-32">
      {/* Luxury Navbar */}
      <nav className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-xl border-b border-brand-text/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="hover:text-brand-accent transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="text-3xl font-serif font-bold tracking-tighter text-brand-accent">
              Slay By Humu
            </Link>
          </div>
          
          <div className="flex gap-6 items-center">
            <Link href="/login" className="hover:text-brand-accent transition-colors">
              <User className="w-6 h-6" />
            </Link>
            <button onClick={openCart} className="hover:text-brand-accent transition-colors relative flex items-center">
              <ShoppingBag className="w-6 h-6" />
              {mounted && cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-soft">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-24">
        {/* Asymmetrical Product Grid Directly visible */}

        {/* Asymmetrical Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-20">
          <AnimatePresence>
            {products.map((product, index) => {
              // Asymmetry logic: Every 3rd item spans 8 columns, others 4 columns
              const isLarge = index % 3 === 0;

              return (
                <motion.div 
                  key={product._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: (index % 3) * 0.1 }}
                  className={`group cursor-pointer flex flex-col ${isLarge ? 'md:col-span-8' : 'md:col-span-4'}`}
                >
                  <Link href={`/products/${product._id}`} className={`flex-1 relative overflow-hidden bg-brand-panel border border-brand-text/5 shadow-soft rounded-3xl mb-8 ${isLarge ? 'h-[50vh] md:h-[65vh]' : 'aspect-[3/4]'}`}>
                    <img 
                      src={product.images?.[0] || 'https://via.placeholder.com/600'} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-opacity duration-[1.5s] group-hover:opacity-0 mix-blend-multiply dark:mix-blend-normal absolute inset-0 z-10 bg-brand-bg rounded-3xl"
                    />
                    
                    {/* Hover Lifestyle Shot */}
                    {product.images && product.images.length > 1 && (
                      <img 
                        src={product.images[1]} 
                        alt={`${product.name} lifestyle`}
                        className="w-full h-full object-cover transition-transform duration-[2s] scale-105 group-hover:scale-100 mix-blend-multiply dark:mix-blend-normal absolute inset-0 z-0 bg-brand-bg rounded-3xl"
                      />
                    )}

                    {/* Interaction Buttons Overlay */}
                    <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-3 opacity-100 md:opacity-0 translate-y-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[400ms] px-4">
                      <span className="flex-1 text-center bg-brand-bg/90 backdrop-blur-md border border-brand-text/10 px-0 py-3 rounded-2xl text-xs font-sans font-medium tracking-widest uppercase text-brand-text shadow-soft hover:bg-brand-bg transition-colors">
                        View Details
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          useCartStore.getState().addItem({ ...product, quantity: 1 });
                          window.dispatchEvent(new Event('open-mini-cart'));
                        }}
                        className="flex-1 text-center bg-brand-accent text-white px-0 py-3 rounded-2xl text-xs font-sans font-semibold tracking-widest uppercase shadow-md hover:bg-amber-600 transition-colors"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </Link>

                  <div className="flex flex-col text-center font-sans tracking-tight">
                    <span className="text-brand-muted text-[10px] uppercase font-semibold tracking-widest mb-3 block">{product.category}</span>
                    <h2 className="text-xl md:text-2xl font-serif tracking-tight text-brand-text mb-2 group-hover:text-brand-accent transition-colors">
                      {product.name}
                    </h2>
                    <span className="text-brand-text font-medium text-lg tracking-tight">
                      ₵{product.price.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}