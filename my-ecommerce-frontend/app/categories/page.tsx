'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { useCartStore } from 'src/store/cartStore';
import { useWishlistStore } from 'src/store/wishlistStore';
import { useNotification } from 'src/context/NotificationContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

const CATEGORY_META: Record<string, { emoji: string; tagline: string }> = {
  straight: { emoji: '✨', tagline: 'Sleek & Refined' },
  curly: { emoji: '🌀', tagline: 'Bold & Bouncy' },
  wavy: { emoji: '🌊', tagline: 'Effortless Flow' },
  short: { emoji: '💎', tagline: 'Chic & Modern' },
  long: { emoji: '👑', tagline: 'Regal Length' },
};

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const addToCart = useCartStore((s) => s.addItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        if (res.ok) {
          const data: Product[] = await res.json();
          const realProducts = data.filter(
            (p) => p.images?.length > 0 && p.images[0]?.startsWith('http')
          );
          setProducts(realProducts);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Dynamic categories from products
  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category.toLowerCase()))];
    return cats.sort();
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory) {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, selectedCategory, searchQuery]);

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      showNotification('Removed from wishlist', 'info');
    } else {
      addToWishlist(product);
      showNotification(`${product.name} added to wishlist`, 'success');
    }
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart(product);
    showNotification(`${product.name} added to bag`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center pb-20">
        <div className="w-8 h-8 border-2 border-brand-text/10 border-t-brand-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-xl border-b border-brand-text/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-brand-muted hover:text-brand-text transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-serif font-bold tracking-tight">Categories</h1>
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 text-brand-muted hover:text-brand-accent transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-brand-panel border border-brand-text/10 rounded-xl py-3 pl-10 pr-4 text-sm font-sans focus:outline-none focus:border-brand-accent transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* ─── LEFT SIDEBAR: Category List ─── */}
        {/* Desktop: always visible. Mobile: toggleable overlay */}
        <AnimatePresence>
          {(mobileSidebarOpen || true) && (
            <motion.aside
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`
                ${mobileSidebarOpen ? 'fixed inset-0 z-[60] bg-brand-bg/95 backdrop-blur-xl pt-24 px-6' : 'hidden'}
                md:block md:static md:bg-transparent md:backdrop-blur-none md:pt-0 md:px-0
                md:w-56 lg:w-64 md:flex-shrink-0 md:border-r md:border-brand-text/5 md:py-6 md:pr-6 md:pl-4
              `}
            >
              {/* Mobile close */}
              {mobileSidebarOpen && (
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="md:hidden absolute top-5 right-5 text-brand-muted hover:text-brand-text"
                >
                  ✕
                </button>
              )}

              <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-brand-muted mb-4 md:mb-6">
                Hair Types
              </h3>

              <div className="space-y-1">
                {/* All */}
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-sans text-sm transition-all ${
                    !selectedCategory
                      ? 'bg-brand-accent/10 text-brand-accent font-semibold border border-brand-accent/20'
                      : 'text-brand-text hover:bg-brand-panel'
                  }`}
                >
                  <span className="mr-2">🔥</span> All Pieces
                  <span className="float-right text-brand-muted text-xs">{products.length}</span>
                </button>

                {categories.map((cat) => {
                  const meta = CATEGORY_META[cat] || { emoji: '💇', tagline: '' };
                  const count = products.filter((p) => p.category.toLowerCase() === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl font-sans text-sm transition-all ${
                        selectedCategory === cat
                          ? 'bg-brand-accent/10 text-brand-accent font-semibold border border-brand-accent/20'
                          : 'text-brand-text hover:bg-brand-panel'
                      }`}
                    >
                      <span className="mr-2">{meta.emoji}</span>
                      <span className="capitalize">{cat}</span>
                      <span className="float-right text-brand-muted text-xs">{count}</span>
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ─── RIGHT SECTION: Product Grid ─── */}
        <main className="flex-1 px-4 md:px-8 py-6">
          {/* Category Header */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-serif tracking-tighter capitalize">
              {selectedCategory ? `${selectedCategory} Collection` : 'All Pieces'}
            </h2>
            <p className="text-brand-muted text-sm font-sans mt-1">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'} available
            </p>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-brand-muted font-sans text-lg mb-4">No pieces found.</p>
              <button
                onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
                className="text-brand-accent font-sans text-sm font-semibold uppercase tracking-widest"
              >
                View All
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.4), duration: 0.4 }}
                  className="group"
                >
                  <Link href={`/products/${product._id}`} className="block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-brand-panel border border-brand-text/5 mb-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[1s] group-hover:scale-105"
                      />
                      {/* Wishlist heart */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-brand-panel/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isInWishlist(product._id) ? 'text-red-500 fill-red-500' : 'text-brand-muted'
                          }`}
                        />
                      </button>
                      {/* Quick Add */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="absolute bottom-3 left-3 right-3 bg-brand-accent text-white text-[10px] font-sans font-semibold uppercase tracking-[0.15em] py-2.5 rounded-full opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-center"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </Link>
                  <div className="text-center font-sans px-1">
                    <h3 className="font-medium text-sm tracking-tight text-brand-text truncate mb-1">
                      {product.name}
                    </h3>
                    <p className="text-brand-accent font-semibold text-sm">₵{product.price.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
