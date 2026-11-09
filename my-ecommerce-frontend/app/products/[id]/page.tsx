// app/products/[id]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useCartStore } from '@/src/store/cartStore';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/src/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShoppingBag, User, Menu, ArrowLeft } from 'lucide-react';
import ImageLoupe from '@/components/ImageLoupe';
import MagneticButton from '@/components/MagneticButton';
import ProductReviews from '@/components/ProductReviews';
import { useNotification } from '@/src/context/NotificationContext';
import { API_URL } from '@/src/lib/api';
import { getOptimizedImageUrl } from '@/src/lib/images';
import { useCartBump, triggerFlyToCart } from '@/components/CartFlyAnimation';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string | { name: string; _id: string };
  images: string[];
  stock?: number;
  texture?: string;
  lace?: string;
  longevity?: string;
  styling?: string;
  badge?: string;
  isSoldOut?: boolean;
}

const HAIR_LENGTHS = [
  { length: '18"', label: '18 Inch', priceDelta: 0 },
  { length: '22"', label: '22 Inch', priceDelta: 150 },
  { length: '26"', label: '26 Inch', priceDelta: 320 },
  { length: '30"', label: '30 Inch', priceDelta: 500 },
];

const HAIR_DENSITIES = [
  { density: '180%', label: '180% Natural Glam', priceDelta: 0 },
  { density: '200%', label: '200% Full Regal', priceDelta: 120 },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  // Variant selections
  const [selectedLength, setSelectedLength] = useState(HAIR_LENGTHS[0].length);
  const [selectedDensity, setSelectedDensity] = useState(HAIR_DENSITIES[0].density);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyButtonRef = useRef<HTMLDivElement>(null);
  
  const addToCart = useCartStore((state) => state.addItem);
  const cartCount = useCartStore((state) => state.getTotalItems());
  const isCartBumped = useCartBump();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeLengthObj = HAIR_LENGTHS.find((l) => l.length === selectedLength) || HAIR_LENGTHS[0];
  const activeDensityObj = HAIR_DENSITIES.find((d) => d.density === selectedDensity) || HAIR_DENSITIES[0];
  const currentPrice = (product?.price || 0) + activeLengthObj.priceDelta + activeDensityObj.priceDelta;
  const isSoldOut = Boolean(product?.isSoldOut || (product?.stock !== undefined && product.stock <= 0));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data);
        
        // Save to recently viewed
        try {
          const key = `recent_products_${user ? user._id : 'guest'}`;
          const recent = JSON.parse(localStorage.getItem(key) || '[]');
          const productSummary = {
            _id: data._id,
            name: data.name,
            price: data.price,
            image: data.images?.[0] || '',
            category: typeof data.category === 'object' ? data.category.name : data.category
          };
          
          // Remove if already exists to put it at the top
          const filteredRecent = recent.filter((p: any) => p._id !== data._id);
          filteredRecent.unshift(productSummary);
          
          // Keep only last 12
          if (filteredRecent.length > 12) {
            filteredRecent.length = 12;
          }
          
          localStorage.setItem(key, JSON.stringify(filteredRecent));
        } catch (e) {
          console.error('Failed to save recently viewed', e);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, user]);

  // Observer for floating sticky mobile buy bar
  useEffect(() => {
    const target = buyButtonRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when main button scrolls out above viewport
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-text/10 border-t-brand-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-serif mb-4">Piece Not Found</h1>
          <p className="text-brand-muted font-sans mb-8">{error || 'This item is no longer available.'}</p>
          <Link href="/products" className="btn-secondary">Return to Collection</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (!product || isSoldOut) return;
    const imgUrl = product.images?.[0] ? getOptimizedImageUrl(product.images[0], 200) : undefined;
    if (e) {
      triggerFlyToCart(e, imgUrl);
    } else {
      triggerFlyToCart(
        { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        imgUrl
      );
    }

    const itemToAdd = {
      ...product,
      price: currentPrice,
      selectedLength: activeLengthObj.length,
      selectedDensity: activeDensityObj.density,
      itemKey: `${product._id}-${activeLengthObj.length}-${activeDensityObj.density}`,
    };
    await addToCart(itemToAdd as any);
    showNotification(`${product.name} (${activeLengthObj.length}, ${activeDensityObj.density}) added to your collection`, 'success');
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/products');
    }
  };

  const handleOpenNav = () => {
    window.dispatchEvent(new Event('open-nav-menu'));
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
      {/* Luxury Navbar */}
      <nav className="sticky top-0 z-50 bg-brand-bg border-b border-brand-text/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleOpenNav}
              className="hidden md:flex p-1 -ml-1 rounded-full hover:text-brand-accent transition-colors items-center justify-center text-brand-text"
              aria-label="Open menu"
              title="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="text-3xl font-serif font-bold tracking-tighter text-brand-accent">
              Slay By Humu
            </Link>
          </div>
          
          <div className="flex gap-4 md:gap-6 items-center">
            <Link href="/login" className="hidden md:flex hover:text-brand-accent transition-colors items-center">
              <User className="w-6 h-6" />
            </Link>
            <button
              onClick={() => window.dispatchEvent(new Event('open-mini-cart'))}
              data-cart-target="true"
              className={`hidden md:flex relative hover:text-brand-accent transition-colors items-center ${
                isCartBumped ? 'animate-cart-landing text-brand-accent' : ''
              }`}
              aria-label="Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {mounted && cartCount > 0 && (
                <span
                  className={`absolute -top-2 -right-2 bg-brand-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-soft ${
                    isCartBumped ? 'animate-badge-landing ring-2 ring-brand-accent/50' : ''
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Breadcrumb / Back Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-8 w-full">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-[0.2em] text-brand-muted hover:text-brand-accent transition-colors group py-1"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-brand-accent" />
          <span>Back to previous page</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-start w-full">
        
        {/* Left: Image Gallery */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full space-y-6"
        >
          {/* Main Loupe View */}
          <div className="w-full bg-brand-panel rounded-[2rem] overflow-hidden shadow-soft border border-brand-text/5 relative">
            <AnimatePresence mode="popLayout">
              {product.images && product.images.length > 0 ? (
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ImageLoupe src={product.images[activeImage]} alt={product.name} />
                </motion.div>
              ) : (
                <div className="w-full h-[60vh] flex items-center justify-center bg-brand-text/5 text-brand-muted font-sans">
                  No Image Available
                </div>
              )}
            </AnimatePresence>
            <div className="absolute top-6 left-6 flex flex-wrap gap-2 z-10">
              <span className="bg-brand-panel/80  px-4 py-1.5 rounded-full text-xs font-sans font-semibold uppercase tracking-widest border border-brand-text/10 shadow-soft">
                {product.badge || '100% Raw Hair'}
              </span>
              {isSoldOut && (
                <span className="bg-black/90 text-white border border-white/20 px-4 py-1.5 rounded-full text-xs font-sans font-bold uppercase tracking-widest shadow-soft backdrop-blur-md">
                  Sold Out
                </span>
              )}
            </div>
            {/* Instruction tooltip */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-brand-panel/80  px-4 py-2 rounded-full border border-brand-text/10 pointer-events-none shadow-soft">
              <svg className="w-4 h-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
              <span className="text-xs font-sans uppercase tracking-widest font-medium">Hover to Inspect Lace</span>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-brand-accent scale-95 shadow-soft ring-4 ring-brand-accent/20' : 'border-transparent hover:border-brand-text/20'
                  }`}
                >
                  <img src={getOptimizedImageUrl(img, 256)} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right: Product Info */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col lg:sticky lg:top-32"
        >
          <div className="mb-4">
            <span className="text-brand-muted text-xs uppercase tracking-[0.3em] font-sans font-semibold">
              {typeof product.category === 'object' ? product.category.name : product.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tighter leading-[1.1] mb-6">
            {product.name}
          </h1>
          
          <div className="text-3xl font-sans font-light tracking-tight mb-8 flex flex-wrap items-baseline gap-3">
            <span className="text-brand-text font-medium">₵{currentPrice.toFixed(2)}</span>
            {isSoldOut && (
              <span className="text-xs font-sans font-bold uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                Currently Unavailable
              </span>
            )}
            {(activeLengthObj.priceDelta > 0 || activeDensityObj.priceDelta > 0) && (
              <span className="text-xs text-brand-muted uppercase tracking-wider font-sans">
                (includes length & density selections)
              </span>
            )}
          </div>

          <div className="prose prose-p:font-sans prose-p:font-light prose-p:text-brand-muted prose-p:leading-relaxed mb-8 border-t border-brand-text/10 pt-8">
            <p>{product.description}</p>
          </div>

          {/* Details Accents */}
          <div className="grid grid-cols-2 gap-6 mb-8 font-sans text-sm">
            <div>
              <p className="text-brand-muted uppercase tracking-widest text-[10px] font-semibold mb-2">Texture</p>
              <p className="font-medium">{product.texture || 'Raw, Unprocessed'}</p>
            </div>
            <div>
              <p className="text-brand-muted uppercase tracking-widest text-[10px] font-semibold mb-2">Lace</p>
              <p className="font-medium">{product.lace || 'Ultra-Thin HD'}</p>
            </div>
            <div>
              <p className="text-brand-muted uppercase tracking-widest text-[10px] font-semibold mb-2">Longevity</p>
              <p className="font-medium">{product.longevity || '2-3+ Years'}</p>
            </div>
            <div>
              <p className="text-brand-muted uppercase tracking-widest text-[10px] font-semibold mb-2">Styling</p>
              <p className="font-medium">{product.styling || 'Takes Bleach & Heat'}</p>
            </div>
          </div>

          {/* Hair Length Selector */}
          <div className="mb-6 border-t border-brand-text/10 pt-6 font-sans">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs uppercase tracking-widest font-semibold text-brand-text">
                Select Length
              </span>
              <span className="text-xs text-brand-accent font-medium">
                {activeLengthObj.label}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {HAIR_LENGTHS.map((item) => {
                const isSelected = selectedLength === item.length;
                return (
                  <button
                    key={item.length}
                    type="button"
                    onClick={() => setSelectedLength(item.length)}
                    className={`py-3 px-2 rounded-xl text-xs font-medium transition-all text-center border cursor-pointer ${
                      isSelected
                        ? 'border-brand-accent bg-brand-accent/10 text-brand-accent ring-2 ring-brand-accent/20 font-semibold shadow-sm'
                        : 'border-brand-text/10 hover:border-brand-text/30 bg-brand-panel text-brand-text'
                    }`}
                  >
                    <div className="text-sm font-semibold">{item.length}</div>
                    <div className="text-[10px] text-brand-muted mt-0.5">
                      {item.priceDelta === 0 ? 'Standard' : `+₵${item.priceDelta}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Density Selector */}
          <div className="mb-8 font-sans">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs uppercase tracking-widest font-semibold text-brand-text">
                Hair Density
              </span>
              <span className="text-xs text-brand-accent font-medium">
                {activeDensityObj.density}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {HAIR_DENSITIES.map((item) => {
                const isSelected = selectedDensity === item.density;
                return (
                  <button
                    key={item.density}
                    type="button"
                    onClick={() => setSelectedDensity(item.density)}
                    className={`py-3 px-3 rounded-xl text-xs font-medium transition-all text-center border cursor-pointer ${
                      isSelected
                        ? 'border-brand-accent bg-brand-accent/10 text-brand-accent ring-2 ring-brand-accent/20 font-semibold shadow-sm'
                        : 'border-brand-text/10 hover:border-brand-text/30 bg-brand-panel text-brand-text'
                    }`}
                  >
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-[10px] text-brand-muted mt-0.5">
                      {item.priceDelta === 0 ? 'Included' : `+₵${item.priceDelta}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={buyButtonRef} className="flex gap-4 font-sans mt-auto border-t border-brand-text/10 pt-8">
            {isSoldOut ? (
              <button
                disabled
                className="w-full py-5 rounded-2xl bg-zinc-800/80 text-zinc-400 border border-white/5 text-xs uppercase tracking-widest font-semibold cursor-not-allowed shadow-none"
              >
                Sold Out — Currently Unavailable
              </button>
            ) : (
              <MagneticButton className="flex-1 w-full block">
                <button
                  onClick={(e) => handleAddToCart(e)}
                  className="w-full btn-gold py-5 shadow-soft border-none hover:cursor-pointer text-xs uppercase tracking-widest font-semibold"
                >
                  Add To Bag — ₵{currentPrice.toFixed(2)}
                </button>
              </MagneticButton>
            )}
          </div>
        </motion.div>
      </div>

      {/* Customer Reviews Section */}
      <ProductReviews productId={product._id} />

      {/* Sticky Mobile Add To Bag Bar */}
      <AnimatePresence>
        {showStickyBar && product && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-16 left-0 right-0 z-[75] md:hidden bg-brand-panel/95 backdrop-blur-lg border-t border-brand-text/10 px-4 py-3 shadow-2xl safe-area-bottom flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-brand-bg flex-shrink-0 border border-brand-text/10">
                {product.images?.[0] ? (
                  <img src={getOptimizedImageUrl(product.images[0], 128)} alt={product.name} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-brand-text truncate">{product.name}</p>
                <div className="flex items-center gap-1 text-[11px] text-brand-muted">
                  <span>{selectedLength}</span>
                  <span>•</span>
                  <span>{selectedDensity}</span>
                  <span>•</span>
                  <span className="text-brand-accent font-semibold">₵{currentPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {isSoldOut ? (
              <button
                disabled
                className="py-2.5 px-5 rounded-full text-[11px] font-sans font-semibold tracking-wider whitespace-nowrap bg-zinc-800 text-zinc-400 border border-white/5 cursor-not-allowed flex-shrink-0"
              >
                Sold Out
              </button>
            ) : (
              <button
                onClick={(e) => handleAddToCart(e)}
                className="btn-gold py-2.5 px-5 rounded-full text-[11px] font-sans font-semibold tracking-wider whitespace-nowrap shadow-md flex-shrink-0"
              >
                Add To Bag
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}