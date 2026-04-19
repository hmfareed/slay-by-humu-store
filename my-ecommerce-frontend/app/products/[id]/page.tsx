// app/products/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/src/store/cartStore';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShoppingBag, User, Menu } from 'lucide-react';
import ImageLoupe from '@/components/ImageLoupe';
import MagneticButton from '@/components/MagneticButton';
import { useNotification } from '@/src/context/NotificationContext';
import { API_URL } from '@/src/lib/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

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

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product);
    showNotification(`${product.name} added to your collection`, 'success');
    window.dispatchEvent(new Event('open-mini-cart'));
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
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
            <button onClick={() => window.dispatchEvent(new Event('open-mini-cart'))} className="relative hover:text-brand-accent transition-colors flex items-center">
              <ShoppingBag className="w-6 h-6" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-start w-full">
        
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
            <div className="absolute top-6 left-6 flex gap-2">
              <span className="bg-brand-panel/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-sans font-semibold uppercase tracking-widest border border-brand-text/10 shadow-soft">
                100% Raw Hair
              </span>
            </div>
            {/* Instruction tooltip */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-brand-panel/80 backdrop-blur-md px-4 py-2 rounded-full border border-brand-text/10 pointer-events-none shadow-soft">
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
                  <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
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
              {product.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tighter leading-[1.1] mb-6">
            {product.name}
          </h1>
          
          <div className="text-3xl font-sans tracking-tight mb-8">
            ₵{product.price.toFixed(2)}
          </div>

          <div className="prose prose-p:font-sans prose-p:font-light prose-p:text-brand-muted prose-p:leading-relaxed mb-12 border-t border-brand-text/10 pt-8">
            <p>{product.description}</p>
          </div>

          {/* Details Accents */}
          <div className="grid grid-cols-2 gap-6 mb-12 font-sans text-sm">
            <div>
              <p className="text-brand-muted uppercase tracking-widest text-[10px] font-semibold mb-2">Texture</p>
              <p className="font-medium">Raw, Unprocessed</p>
            </div>
            <div>
              <p className="text-brand-muted uppercase tracking-widest text-[10px] font-semibold mb-2">Lace</p>
              <p className="font-medium">Ultra-Thin HD</p>
            </div>
            <div>
              <p className="text-brand-muted uppercase tracking-widest text-[10px] font-semibold mb-2">Longevity</p>
              <p className="font-medium">2-3+ Years</p>
            </div>
            <div>
              <p className="text-brand-muted uppercase tracking-widest text-[10px] font-semibold mb-2">Styling</p>
              <p className="font-medium">Takes Bleach & Heat</p>
            </div>
          </div>

          <div className="flex gap-4 font-sans mt-auto border-t border-brand-text/10 pt-8">
            <MagneticButton className="flex-1 w-full block">
              <button
                onClick={handleAddToCart}
                className="w-full btn-gold py-5 shadow-soft border-none hover:cursor-pointer"
              >
                Add To Bag — ₵{product.price.toFixed(2)}
              </button>
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}