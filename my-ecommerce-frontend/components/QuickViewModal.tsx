'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Check, Ban } from 'lucide-react';
import { useCartStore } from '@/src/store/cartStore';
import { getOptimizedImageUrl } from '@/src/lib/images';
import { triggerFlyToCart } from '@/components/CartFlyAnimation';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string | { name: string; _id: string };
  images: string[];
  stock?: number;
  isSoldOut?: boolean;
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);

  if (!product) return null;

  const isSoldOut = Boolean(product.isSoldOut || (product.stock !== undefined && product.stock <= 0));

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (isSoldOut) return;
    // Capture click position
    const clickPos = e ? { x: e.clientX, y: e.clientY } : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const imgUrl = product.images?.[0] ? getOptimizedImageUrl(product.images[0], 200) : undefined;

    triggerFlyToCart(clickPos, imgUrl);
    setAdding(true);
    addToCart({
      ...product,
      quantity: 1,
    });

    setTimeout(() => {
      setAdding(false);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 900);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-brand-panel rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-brand-text/10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/10 hover:bg-black/20 text-brand-text rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Gallery */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-brand-text/5 relative">
              {product.images?.[0] ? (
                <img 
                  src={getOptimizedImageUrl(product.images[0], 640)} 
                  alt={product.name} 
                  className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-muted">No Image</div>
              )}
              {isSoldOut && (
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <span className="bg-black/85 text-white border border-white/20 text-[10px] font-sans font-semibold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto custom-scrollbar">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-brand-text mb-4">
                  {product.name}
                </h2>
                <p className="text-2xl font-sans font-light text-brand-text">
                  ₵{product.price.toFixed(2)}
                </p>
              </div>

              <div className="prose prose-sm dark:prose-invert mb-10 text-brand-muted font-sans line-clamp-6">
                <p>{product.description}</p>
              </div>

              <div className="mt-auto pt-8 border-t border-brand-text/5">
                {isSoldOut ? (
                  <button
                    disabled
                    className="w-full py-5 rounded-2xl bg-zinc-800/80 text-zinc-400 border border-white/5 text-base font-sans font-medium flex items-center justify-center gap-2 cursor-not-allowed shadow-none"
                  >
                    <Ban className="w-5 h-5 text-zinc-500" /> Sold Out
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleAddToCart(e)}
                    disabled={adding || added}
                    className="w-full btn-gold py-5 text-lg font-sans font-medium flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-80 disabled:cursor-not-allowed"
                  >
                    {adding ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : added ? (
                      <>
                        <Check className="w-5 h-5" /> Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" /> Add to Cart
                      </>
                    )}
                    <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
