'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-bg text-brand-muted py-16 md:py-24 font-sans border-t border-brand-text/5 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Newsletter Section */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <h3 className="text-brand-accent text-[10px] uppercase tracking-[0.2em] font-bold mb-4">Stay in the know</h3>
            <p className="text-brand-text font-serif text-2xl leading-snug mb-6 max-w-sm">
              Join our community of hair lovers and beauty enthusiasts
            </p>
            <div className="w-full flex">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-transparent border border-brand-text/20 text-brand-text text-sm px-4 py-3 w-full focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
              />
              <button className="bg-brand-accent hover:bg-[var(--color-brand-accent-hover)] text-white text-[10px] font-bold tracking-widest uppercase px-6 py-3 transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Brand Info */}
          <div className="lg:col-span-3">
            <h3 className="text-brand-accent text-sm tracking-[0.15em] font-serif mb-4 uppercase">Slay By Humu</h3>
            <p className="text-sm leading-relaxed max-w-xs text-brand-text">
              Luxury raw hair and extensions crafted with artistry, worn with elegance.
            </p>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-muted mb-4">Shop</h4>
              <ul className="space-y-3 text-sm text-brand-text/80">
                <li><Link href="/products?category=straight" className="hover:text-brand-accent transition-colors">Straight</Link></li>
                <li><Link href="/products?category=curly" className="hover:text-brand-accent transition-colors">Curly</Link></li>
                <li><Link href="/products?category=wavy" className="hover:text-brand-accent transition-colors">Wavy</Link></li>
                <li><Link href="/products" className="hover:text-brand-accent transition-colors">All Products</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-muted mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-brand-text/80">
                <li><Link href="/about" className="hover:text-brand-accent transition-colors">About</Link></li>
                <li><Link href="/services" className="hover:text-brand-accent transition-colors">Services</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-muted mb-4">Account</h4>
              <ul className="space-y-3 text-sm text-brand-text/80">
                <li><Link href="/login" className="hover:text-brand-accent transition-colors">Sign In</Link></li>
                <li><Link href="/login" className="hover:text-brand-accent transition-colors">Create Account</Link></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="mt-20 pt-8 border-t border-brand-text/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-muted">
          <p>© 2026 Slay By Humu. All rights reserved.</p>
          <div className="flex flex-row flex-wrap justify-center md:justify-end items-center gap-2 md:gap-4">
            <p>Secured payment by Paystack</p>
            <p className="hidden md:block">•</p>
            <p>Built by <strong className="text-brand-text font-semibold uppercase tracking-wider ml-1 bg-brand-text/5 px-2 py-1 rounded-md">Fareed Core Tech</strong></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
