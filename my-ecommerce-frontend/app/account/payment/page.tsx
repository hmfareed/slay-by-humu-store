'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Smartphone } from 'lucide-react';

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <header className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-xl border-b border-brand-text/5">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-5 flex items-center gap-3">
          <Link href="/account" className="text-brand-muted hover:text-brand-text transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-serif font-bold tracking-tight">Payment Methods</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-brand-panel border border-brand-text/5 flex items-center justify-center">
            <CreditCard className="w-12 h-12 text-brand-muted" strokeWidth={1} />
          </div>
          <h2 className="text-2xl font-serif tracking-tight mb-3">Payment Methods</h2>
          <p className="text-brand-muted font-sans font-light text-sm mb-8 max-w-sm mx-auto">
            Payment is currently handled at checkout via Mobile Money. Card payments coming soon.
          </p>

          {/* Supported methods */}
          <div className="max-w-xs mx-auto space-y-3">
            <div className="bg-brand-panel rounded-2xl border border-brand-text/5 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <p className="font-sans font-medium text-sm">MTN Mobile Money</p>
                <p className="text-brand-muted text-xs font-sans">Instant payment</p>
              </div>
              <span className="ml-auto text-[9px] font-sans font-bold uppercase tracking-widest text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full">Active</span>
            </div>
            <div className="bg-brand-panel rounded-2xl border border-brand-text/5 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-left">
                <p className="font-sans font-medium text-sm">Vodafone Cash</p>
                <p className="text-brand-muted text-xs font-sans">Instant payment</p>
              </div>
              <span className="ml-auto text-[9px] font-sans font-bold uppercase tracking-widest text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full">Active</span>
            </div>
            <div className="bg-brand-panel rounded-2xl border border-brand-text/5 p-4 flex items-center gap-4 opacity-50">
              <div className="w-10 h-10 rounded-xl bg-brand-text/5 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-brand-muted" />
              </div>
              <div className="text-left">
                <p className="font-sans font-medium text-sm">Debit / Credit Card</p>
                <p className="text-brand-muted text-xs font-sans">Visa, Mastercard</p>
              </div>
              <span className="ml-auto text-[9px] font-sans font-bold uppercase tracking-widest text-brand-muted bg-brand-text/5 px-2.5 py-1 rounded-full">Soon</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
