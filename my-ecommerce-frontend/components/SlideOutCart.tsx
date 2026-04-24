'use client';

import { useCartStore } from '@/src/store/cartStore';
import { X, ShoppingBag, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/src/context/NotificationContext';

export default function SlideOutCart() {
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { showNotification } = useNotification();
  
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const [localOpen, setLocalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleOpen = () => setLocalOpen(true);
    window.addEventListener('open-mini-cart', handleOpen);
    
    return () => window.removeEventListener('open-mini-cart', handleOpen);
  }, []);

  const handleClose = () => {
    setLocalOpen(false);
  };

  const checkout = () => {
    handleClose();
    router.push('/checkout');
  };

  if (!mounted || !localOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        className="absolute inset-0 bg-black/70"
      />
      
      {/* Cart Drawer */}
      <div 
        className="relative h-full w-full sm:w-[450px] bg-brand-panel shadow-2xl flex flex-col border-l border-brand-text/5 animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-brand-text/5">
          <h2 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-3 text-brand-text">
            <ShoppingBag strokeWidth={1.5} size={24} />
            Your Selected Cart
          </h2>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-brand-text/5 transition-colors text-brand-text"
          >
            <X size={24} strokeWidth={1} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-brand-muted gap-4">
              <ShoppingBag size={48} strokeWidth={0.5} />
              <p className="font-sans font-light">Your cart is elegantly empty.</p>
              <button onClick={handleClose} className="btn-secondary mt-4">Discover Pieces</button>
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((item) => (
                <div 
                  key={item.product._id}
                  className="flex gap-5 group"
                >
                  <div className="w-24 h-32 bg-brand-bg relative overflow-hidden">
                    {item.product.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                    ) : null}
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-sans font-medium text-brand-text tracking-wide whitespace-nowrap overflow-hidden text-ellipsis w-[180px]">{item.product.name}</h3>
                    </div>
                    <p className="text-brand-muted text-sm font-sans mb-auto uppercase tracking-widest">{typeof item.product.category === 'object' ? item.product.category.name : item.product.category}</p>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center gap-3 border border-brand-text/10 rounded-full px-2 py-1">
                        <button 
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="p-1 hover:bg-brand-text/5 rounded-full transition-colors text-brand-muted hover:text-brand-text"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-sans font-medium text-brand-text w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="p-1 hover:bg-brand-text/5 rounded-full transition-colors text-brand-muted hover:text-brand-text"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-lg font-medium text-brand-text tracking-tight">₵{(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                    
                    <button 
                      onClick={async () => {
                        await removeItem(item.product._id);
                        showNotification('Item removed from collection', 'info');
                      }}
                      className="text-xs text-brand-muted font-sans uppercase tracking-[0.2em] mt-3 hover:text-red-500 transition-colors self-start"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 md:p-8 bg-brand-panel border-t border-brand-text/5">
            <div className="flex justify-between text-xl font-medium mb-6 text-brand-text">
              <span className="font-sans font-light">Subtotal</span>
              <span className="tracking-tighter">₵{getTotalPrice().toFixed(2)}</span>
            </div>
            
            <p className="font-sans text-brand-muted text-xs tracking-widest uppercase mb-6 flex justify-between">
              <span>Shipping & Taxes</span>
              <span>Calculated at checkout</span>
            </p>

            <button 
              onClick={checkout}
              className="w-full btn-gold py-5 shadow-soft rounded-none text-brand-bg font-sans uppercase tracking-widest text-sm"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
