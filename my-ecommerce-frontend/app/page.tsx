// app/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { API_URL } from '@/src/lib/api';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [frontendUrl, setFrontendUrl] = useState('http://localhost:3000');
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000');

  useEffect(() => {
    setMounted(true);
    setFrontendUrl(window.location.origin);
    setBackendUrl(API_URL.replace('/api', ''));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black">Slay by Humu  </h1>
          
          <div className="flex items-center gap-8 text-lg">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/products" className="hover:text-blue-600 transition-colors">Shop</Link>
            <Link href="/cart" className="hover:text-blue-600 transition-colors">Cart</Link>
            <Link href="/login" className="hover:text-blue-600 transition-colors">Account</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-black text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-6xl font-bold mb-6">Shop the Best Products</h2>
          <p className="text-2xl text-gray-300 mb-10">Quality products at amazing prices</p>
          
          <Link 
            href="/products"
            className="inline-block bg-white text-black px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>

      {/* Status Info */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-600 text-xl">
          Backend running on <span className="font-mono font-medium text-black">{mounted ? backendUrl : 'Loading...'}</span><br />
          Frontend running on <span className="font-mono font-medium text-black">{mounted ? frontendUrl : 'Loading...'}</span>
        </p>
      </div>
    </div>
  );
}