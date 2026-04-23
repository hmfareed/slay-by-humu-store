// app/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/src/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNotification } from '@/src/context/NotificationContext';
import { useAuth } from '@/src/context/AuthContext';
import { API_URL } from '@/src/lib/api';

export default function CheckoutPage() {
  const { showNotification } = useNotification();
  const { token } = useAuth();
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    country: 'Ghana',
    postalCode: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  // Address Autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = useCartStore((state) => state.getTotalPrice());

  // Fetch saved addresses and auto-fill default
  useEffect(() => {
    if (!token) return;
    const fetchDefault = async () => {
      try {
        const res = await fetch(`${API_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const addrs = await res.json();
          setSavedAddresses(addrs);
          const defaultAddr = addrs.find((a: any) => a.isDefault) || addrs[0];
          if (defaultAddr) {
            setShippingAddress({
              address: `${defaultAddr.street}, ${defaultAddr.region}`,
              city: defaultAddr.city,
              country: 'Ghana',
              postalCode: defaultAddr.gpsAddress || '',
              phoneNumber: '',
            });
          }
        }
      } catch { /* silent */ }
    };
    fetchDefault();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value,
    });

    if (name === 'address') {
      setIsTyping(true);
      if (value.length > 2) {
        debouncedFetchSuggestions(value);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  // Debounced address search
  const debouncedFetchSuggestions = (() => {
    let timeoutId: NodeJS.Timeout;
    return (query: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=gh&limit=5`);
          const data = await res.json();
          setAddressSuggestions(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Failed to fetch address suggestions:", error);
        } finally {
          setIsTyping(false);
        }
      }, 500);
    };
  })();

  const selectSuggestion = (suggestion: any) => {
    const city = suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || suggestion.address?.state_district || '';
    setShippingAddress(prev => ({
      ...prev,
      address: suggestion.display_name,
      city: city
    }));
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      showNotification('Please login to place an order', 'error');
      return;
    }

    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.phoneNumber) {
      showNotification('Please fill in all shipping details, including your phone number', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setOrderSuccess(true);
        setOrderId(data.order?._id || 'unknown');
        clearCart(); // Clear local cart
        showNotification('Order placed successfully', 'success');
      } else {
        showNotification(data.message || 'Failed to place order', 'error');
      }
    } catch (error) {
      console.error('Order error:', error);
      showNotification('Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center p-6 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-brand-accent/5 blur-[150px] pointer-events-none -z-10" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-brand-panel  p-16 rounded-3xl shadow-soft border border-brand-text/5 text-center max-w-xl mx-auto relative z-10"
        >
          {/* Subtle Confetti/Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-brand-accent/10 blur-[100px] pointer-events-none" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-brand-accent text-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl shadow-brand-accent/30"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <h1 className="text-5xl font-bold mb-4 tracking-tighter">Order Confirmed.</h1>
          <p className="text-brand-muted text-xl mb-8 font-sans font-light">Your bespoke items are being prepared for dispatch.</p>
          
          <div className="bg-brand-bg/50 py-4 px-6 rounded-2xl mb-12 flex items-center justify-between border border-brand-text/5 font-sans">
            <span className="text-sm text-brand-muted uppercase tracking-widest font-medium">Order Ref</span>
            <span className="font-mono text-brand-text font-medium tracking-wider text-xl">{orderId.slice(-8).toUpperCase()}</span>
          </div>
          
          <Link 
            href="/"
            className="btn-primary w-full block text-lg py-5 tracking-wide shadow-soft"
          >
            Return to Collection
          </Link>
        </motion.div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-4xl font-light mb-8 tracking-tight font-sans text-brand-muted">Your collection is empty.</h2>
          <Link href="/products" className="btn-primary px-12 py-5 shadow-soft">
            Curate Pieces
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Luxury Navbar */}
      <nav className="sticky top-0 z-50 bg-brand-bg  border-b border-brand-text/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-5 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold tracking-tighter">
            Slay by Humu
            <span className="text-brand-accent">.</span>
          </Link>
          
          <div className="flex gap-6 md:gap-10 text-[15px] font-sans font-medium tracking-wide items-center">
            <Link href="/" className="hover:text-brand-accent transition-colors hidden md:block">Home</Link>
            <Link href="/products" className="hover:text-brand-accent transition-colors">Shop</Link>
            <Link href="/cart" className="hover:text-brand-accent transition-colors hidden md:block">Cart</Link>
            <Link href="/login" className="hover:text-brand-accent transition-colors hidden md:block">Account</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-24 md:py-32 relative">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-brand-accent/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold mb-16 tracking-tighter"
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-16">
          {/* Shipping Form */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="bg-brand-panel p-10 md:p-14 border border-brand-text/5 shadow-soft rounded-3xl"
            >
              <h2 className="text-3xl font-bold mb-12 tracking-tight">Delivery Details</h2>
              
              <div className="space-y-10 font-sans">
                <div className="group relative">
                  <input
                    type="text"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    className="peer w-full px-0 py-4 bg-transparent border-b-2 border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-xl font-light placeholder-transparent"
                    placeholder="Street Address"
                    required
                  />
                  <label className="absolute left-0 top-4 text-brand-muted text-xl transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-brand-accent peer-focus:font-semibold peer-valid:-top-4 peer-valid:text-xs peer-valid:text-brand-accent peer-valid:font-semibold cursor-text">
                    Street Address
                  </label>

                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <motion.ul 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full bg-brand-panel border border-brand-text/10 shadow-soft rounded-2xl mt-2 overflow-hidden max-h-60 overflow-y-auto"
                      >
                        {addressSuggestions.map((suggestion, idx) => (
                          <li 
                            key={idx}
                            onClick={() => selectSuggestion(suggestion)}
                            className="px-4 py-3 hover:bg-brand-text/5 cursor-pointer border-b border-brand-text/5 last:border-0 text-sm font-sans"
                          >
                            {suggestion.display_name}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="group relative">
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className="peer w-full px-0 py-4 bg-transparent border-b-2 border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-xl font-light placeholder-transparent"
                      placeholder="City"
                      required
                    />
                    <label className="absolute left-0 top-4 text-brand-muted text-xl transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-brand-accent peer-focus:font-semibold peer-valid:-top-4 peer-valid:text-xs peer-valid:text-brand-accent peer-valid:font-semibold cursor-text">
                      City
                    </label>
                  </div>
                  <div className="group relative">
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      className="peer w-full px-0 py-4 bg-transparent border-b-2 border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-xl font-light placeholder-transparent"
                      placeholder="Postal Code"
                      required
                    />
                    <label className="absolute left-0 top-4 text-brand-muted text-xl transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-brand-accent peer-focus:font-semibold peer-valid:-top-4 peer-valid:text-xs peer-valid:text-brand-accent peer-valid:font-semibold cursor-text">
                      Postal Code
                    </label>
                  </div>
                </div>

                <div className="group relative">
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={shippingAddress.phoneNumber}
                    onChange={handleInputChange}
                    className="peer w-full px-0 py-4 bg-transparent border-b-2 border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-xl font-light placeholder-transparent"
                    placeholder="Phone Number"
                    required
                  />
                  <label className="absolute left-0 top-4 text-brand-muted text-xl transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-brand-accent peer-focus:font-semibold peer-valid:-top-4 peer-valid:text-xs peer-valid:text-brand-accent peer-valid:font-semibold cursor-text">
                    Phone Number
                  </label>
                </div>

                <div className="pt-4">
                  <label className="block text-xs font-medium mb-3 tracking-widest uppercase text-brand-muted">Country</label>
                  <div className="relative">
                    <select
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleInputChange}
                      className="w-full px-6 py-5 bg-brand-bg border border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-lg font-light rounded-2xl appearance-none"
                    >
                      <option value="Ghana">Ghana</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-6 pointer-events-none text-brand-muted">
                      ▼
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-brand-panel text-brand-text p-10 md:p-14 sticky top-32 rounded-3xl shadow-soft border border-brand-text/5"
            >
              <h2 className="text-3xl font-bold mb-10 tracking-tight">Order Summary</h2>

              <div className="space-y-8 mb-10 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="flex justify-between items-center text-sm font-sans font-light">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-20 bg-brand-text/5 overflow-hidden rounded-xl flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover dark:mix-blend-normal mix-blend-multiply" />
                        ) : null}
                      </div>
                      <span className="max-w-[140px] truncate text-base leading-snug">
                        <span className="font-medium text-lg block truncate mb-1">{item.product.name}</span>
                        <span className="text-brand-accent font-medium">× {item.quantity}</span>
                      </span>
                    </div>
                    <span className="text-lg">₵{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-text/10 pt-8 mb-10">
                <div className="flex justify-between text-3xl font-sans font-medium tracking-tight">
                  <span>Total</span>
                  <span>₵{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full btn-gold py-5 text-xl tracking-wide disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                {loading ? (
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="relative z-10">Complete Purchase</span>
                )}
                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              </button>

              <div className="mt-8 flex justify-center items-center gap-3 text-brand-muted text-xs font-sans">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <span>Secure SSL Encrypted Checkout</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
