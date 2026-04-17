// app/page.tsx
'use client';

import Link from 'next/link';
import { ThemeToggle } from '../components/ThemeToggle';
import { ShoppingBag, User, Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useCartStore } from 'src/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

// Hair categories with icons/descriptions
const HAIR_CATEGORIES = [
  { name: 'Straight', slug: 'straight', emoji: '✨', tagline: 'Sleek & Refined' },
  { name: 'Curly', slug: 'curly', emoji: '🌀', tagline: 'Bold & Bouncy' },
  { name: 'Wavy', slug: 'wavy', emoji: '🌊', tagline: 'Effortless Flow' },
  { name: 'Short', slug: 'short', emoji: '💎', tagline: 'Chic & Modern' },
  { name: 'Long', slug: 'long', emoji: '👑', tagline: 'Regal Length' },
];

export default function HomePage() {
  const cartItemsCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products from API
  useEffect(() => {
    setMounted(true);
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        if (res.ok) {
          const data: Product[] = await res.json();
          // Filter to only products with images (real wigs, not test data)
          const realProducts = data.filter(
            (p) => p.images && p.images.length > 0 && p.images[0].startsWith('http')
          );
          setProducts(realProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Auto-rotate hero every 3 seconds
  useEffect(() => {
    if (products.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % products.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [products.length]);

  const goToSlide = useCallback((direction: 'prev' | 'next') => {
    if (products.length === 0) return;
    setHeroIndex((prev) =>
      direction === 'next'
        ? (prev + 1) % products.length
        : (prev - 1 + products.length) % products.length
    );
  }, [products.length]);

  const openCart = () => {
    window.dispatchEvent(new Event('open-mini-cart'));
  };

  // Get unique categories that actually have products
  const activeCategories = HAIR_CATEGORIES.filter((cat) =>
    products.some((p) => p.category.toLowerCase() === cat.slug)
  );

  // Get products by category
  const getProductsByCategory = (slug: string) =>
    products.filter((p) => p.category.toLowerCase() === slug);

  const currentHeroProduct = products[heroIndex];

  return (
    <div className="relative font-sans bg-brand-bg text-brand-text min-h-screen">
      {/* ─── HEADER: Logo + Icons ─── */}
      <header className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-xl border-b border-brand-text/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          {/* Top bar */}
          <div className="flex items-center justify-between py-5">
            <Link href="/" className="text-3xl md:text-4xl font-serif font-bold tracking-tighter text-brand-accent">
              SLAY BY HUMU
            </Link>

            <div className="flex gap-5 items-center">
              <Link href="/login" className="hover:text-brand-accent transition-colors">
                <User className="w-5 h-5" />
              </Link>
              <button onClick={openCart} className="relative hover:text-brand-accent transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {mounted && cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* Search Bar directly under logo */}
          <div className="pb-5">
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search our collection..."
                className="w-full bg-brand-panel border border-brand-text/10 rounded-full py-3.5 pl-12 pr-6 text-sm font-sans focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 transition-all shadow-sm placeholder:text-brand-muted"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-muted" />
            </div>
          </div>
        </div>
      </header>

      {/* ─── HERO SLIDESHOW: Auto-rotating product images every 3s ─── */}
      <section className="relative w-full overflow-hidden bg-brand-panel" style={{ height: 'clamp(300px, 60vh, 600px)' }}>
        <AnimatePresence mode="wait">
          {currentHeroProduct && (
            <motion.div
              key={currentHeroProduct._id + heroIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              className="absolute inset-0"
            >
              <img
                src={currentHeroProduct.images[0]}
                alt={currentHeroProduct.name}
                className="w-full h-full object-cover object-center"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Hero text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <span className="inline-block text-white/70 text-xs font-sans uppercase tracking-[0.3em] mb-3">
                    {currentHeroProduct.category}
                  </span>
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white tracking-tighter leading-[1.1] mb-4 max-w-lg">
                    {currentHeroProduct.name}
                  </h2>
                  <div className="flex items-center gap-6">
                    <span className="text-white/90 text-2xl font-sans font-light">
                      ₵{currentHeroProduct.price.toFixed(2)}
                    </span>
                    <Link
                      href={`/products/${currentHeroProduct._id}`}
                      className="inline-flex items-center gap-2 bg-white text-black font-sans text-xs font-semibold uppercase tracking-[0.15em] px-8 py-3.5 rounded-full hover:bg-brand-accent hover:text-white transition-all duration-300"
                    >
                      Shop Now
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slide controls */}
        {products.length > 1 && (
          <>
            <button
              onClick={() => goToSlide('prev')}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => goToSlide('next')}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === heroIndex
                      ? 'w-8 h-2 bg-brand-accent'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ─── CATEGORY PILLS ─── */}
      <section className="py-10 md:py-14 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-serif tracking-tighter mb-3">Shop by Category</h2>
          <p className="text-brand-muted font-sans font-light text-sm max-w-md mx-auto">
            Browse our curated collections, each crafted with premium raw hair
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {activeCategories.map((cat, i) => {
            const count = getProductsByCategory(cat.slug).length;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 p-6 md:p-8 bg-brand-panel border border-brand-text/5 rounded-2xl hover:border-brand-accent/30 hover:shadow-soft transition-all duration-300 min-w-[140px]"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
                  <span className="font-sans font-semibold text-sm uppercase tracking-widest text-brand-text">
                    {cat.name}
                  </span>
                  <span className="text-brand-muted text-[11px] font-sans">{cat.tagline}</span>
                  <span className="text-brand-accent text-[10px] font-sans font-semibold uppercase tracking-widest">
                    {count} {count === 1 ? 'piece' : 'pieces'}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS GRID: By Category ─── */}
      {activeCategories.map((cat, catIdx) => {
        const catProducts = getProductsByCategory(cat.slug);
        if (catProducts.length === 0) return null;

        return (
          <section
            key={cat.slug}
            className="py-12 md:py-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <span className="text-brand-accent text-xs font-sans font-semibold uppercase tracking-[0.3em] mb-2 block">
                  {cat.emoji} {cat.tagline}
                </span>
                <h2 className="text-3xl md:text-4xl font-serif tracking-tighter">{cat.name} Collection</h2>
              </div>
              <Link
                href={`/products?category=${cat.slug}`}
                className="hidden md:inline-flex items-center gap-2 text-brand-muted hover:text-brand-accent text-xs font-sans font-medium uppercase tracking-widest transition-colors"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {catProducts.map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <Link
                    href={`/products/${product._id}`}
                    className="group block"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-brand-panel border border-brand-text/5 mb-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                      {/* Interaction Buttons Overlay */}
                      <div className="absolute flex flex-col md:flex-row bottom-3 left-3 right-3 gap-2 opacity-100 md:opacity-0 translate-y-0 md:translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <span className="flex-1 text-center bg-white/90 dark:bg-brand-panel/90 backdrop-blur-md text-brand-text text-[10px] font-sans font-semibold uppercase tracking-[0.2em] py-2.5 rounded-full shadow-sm hover:bg-white transition-colors">
                          View
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            useCartStore.getState().addItem({ ...product, quantity: 1 });
                            window.dispatchEvent(new Event('open-mini-cart'));
                          }}
                          className="flex-1 text-center bg-brand-accent text-white text-[10px] font-sans font-semibold uppercase tracking-[0.2em] py-2.5 rounded-full shadow-md hover:bg-amber-600 transition-colors"
                        >
                          Add Bag
                        </button>
                      </div>
                    </div>

                    <div className="text-center font-sans px-1">
                      <h3 className="font-medium text-sm md:text-base tracking-tight text-brand-text group-hover:text-brand-accent transition-colors mb-1.5 truncate">
                        {product.name}
                      </h3>
                      <p className="text-brand-accent font-semibold text-sm">
                        ₵{product.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile: View All link */}
            <div className="mt-8 text-center md:hidden">
              <Link
                href={`/products?category=${cat.slug}`}
                className="inline-flex items-center gap-2 text-brand-accent text-xs font-sans font-semibold uppercase tracking-widest"
              >
                View All {cat.name}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Divider between categories */}
            {catIdx < activeCategories.length - 1 && (
              <div className="mt-12 md:mt-16 border-t border-brand-text/5" />
            )}
          </section>
        );
      })}

      {/* ─── FOOTER BANNER ─── */}
      <section className="py-20 md:py-28 px-4 md:px-8 text-center bg-brand-panel border-t border-brand-text/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-serif tracking-tighter mb-4 text-brand-accent">Slay By Humu.</h2>
          <p className="text-brand-muted font-sans font-light text-lg max-w-lg mx-auto mb-10">
            Premium raw hair collections masterfully crafted for flawless presentation and commanding elegance.
          </p>
          <Link
            href="/products"
            className="btn-gold inline-flex items-center gap-3 px-12 py-4 shadow-soft text-sm"
          >
            Explore Full Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-6 md:gap-12">
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">📦</span>
            <span className="text-[10px] md:text-xs font-sans font-semibold uppercase tracking-widest text-brand-text">Nationwide Shipping</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">💎</span>
            <span className="text-[10px] md:text-xs font-sans font-semibold uppercase tracking-widest text-brand-text">100% Raw Hair</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">🔒</span>
            <span className="text-[10px] md:text-xs font-sans font-semibold uppercase tracking-widest text-brand-text">Secure Checkout</span>
          </div>
        </div>
      </section>
    </div>
  );
}