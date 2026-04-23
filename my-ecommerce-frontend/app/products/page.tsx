'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShoppingBag, User, Menu, Filter, X } from 'lucide-react';
import QuickViewModal from '@/components/QuickViewModal';
import { useCartStore } from '@/src/store/cartStore';
import { API_URL } from '@/src/lib/api';

import { Suspense } from 'react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  // Filter States
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  const cartItemsCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
  const [mounted, setMounted] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sort) params.append('sort', sort);

      const res = await fetch(`${API_URL}/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, search, minPrice, maxPrice, sort]);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, [fetchProducts]);

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
      <nav className="sticky top-0 z-50 bg-brand-bg  border-b border-brand-text/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="hover:text-brand-accent transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="text-3xl font-serif font-bold tracking-tighter text-brand-accent">
              SLAY BY HUMU
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

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 pt-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif tracking-tighter">
              {search ? `Search: "${search}"` : category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection` : 'All Collection'}
            </h1>
            <p className="text-brand-muted font-sans text-sm mt-2">{products.length} pieces found</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-panel border border-brand-text/10 rounded-full text-sm font-medium hover:bg-brand-text/5 transition-colors"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 bg-brand-panel border border-brand-text/10 rounded-full text-sm font-medium focus:outline-none focus:border-brand-accent transition-colors cursor-pointer appearance-none"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter Menu */}
          {showFilters && (
            <aside className="flex-shrink-0 lg:sticky top-32 h-fit hidden lg:block w-[280px]">
              <div className="bg-brand-panel border border-brand-text/5 rounded-3xl p-6 space-y-8">
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase mb-4 text-brand-muted">Categories</h3>
                  <div className="space-y-3">
                    {['All', 'Straight', 'Curly', 'Wavy', 'Short', 'Long'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat === 'All' ? '' : cat.toLowerCase())}
                        className={`block w-full text-left text-sm font-medium transition-colors ${
                          (category === cat.toLowerCase() || (cat === 'All' && !category))
                            ? 'text-brand-accent'
                            : 'hover:text-brand-accent text-brand-text'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase mb-4 text-brand-muted">Price Range</h3>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-text/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
                    />
                    <span>-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-text/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>

                {(category || minPrice || maxPrice || search) && (
                  <button 
                    onClick={() => {
                      setCategory('');
                      setMinPrice('');
                      setMaxPrice('');
                      setSearch('');
                    }}
                    className="w-full py-2 bg-red-500/10 text-red-500 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-red-500/20 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </aside>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {products.length === 0 && !loading ? (
              <div className="py-20 text-center border border-brand-text/5 rounded-3xl bg-brand-panel">
                <p className="text-brand-muted font-sans">No products found matching your criteria.</p>
                <button 
                  onClick={() => { setCategory(''); setMinPrice(''); setMaxPrice(''); setSearch(''); }}
                  className="mt-4 text-brand-accent text-sm font-bold uppercase tracking-widest hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {products.map((product, index) => (
                  <div 
                    key={product._id}
                    className="group cursor-pointer flex flex-col"
                  >
                    <Link href={`/products/${product._id}`} className="flex-1 relative overflow-hidden bg-brand-panel border border-brand-text/5 shadow-soft rounded-3xl mb-6 aspect-[3/4]">
                      <img 
                        src={product.images?.[0] || 'https://via.placeholder.com/600'} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-opacity duration-[1.5s] group-hover:opacity-0 mix-blend-multiply dark:mix-blend-normal absolute inset-0 z-10 bg-brand-bg rounded-3xl"
                      />
                      
                      {product.images && product.images.length > 1 && (
                        <img 
                          src={product.images[1]} 
                          alt={`${product.name} lifestyle`}
                          className="w-full h-full object-cover transition-transform duration-[2s] scale-105 group-hover:scale-100 mix-blend-multiply dark:mix-blend-normal absolute inset-0 z-0 bg-brand-bg rounded-3xl"
                        />
                      )}

                      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-3 opacity-100 md:opacity-0 translate-y-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[400ms] px-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setQuickViewProduct(product);
                          }}
                          className="flex-1 text-center bg-brand-bg border border-brand-text/10 px-0 py-3 rounded-2xl text-xs font-sans font-medium tracking-widest uppercase text-brand-text shadow-soft hover:bg-brand-text/5 transition-colors"
                        >
                          Quick View
                        </button>
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
                      <h2 className="text-lg md:text-xl font-serif tracking-tight text-brand-text mb-2 group-hover:text-brand-accent transition-colors truncate">
                        {product.name}
                      </h2>
                      <span className="text-brand-text font-medium tracking-tight">
                        ₵{product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Quick View Modal */}
      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-text/10 border-t-brand-accent rounded-full animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
