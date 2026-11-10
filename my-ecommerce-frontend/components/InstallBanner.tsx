'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Sparkles } from 'lucide-react';
import { usePWAStore } from '@/src/store/pwaStore';

export default function InstallBanner() {
  const [mounted, setMounted] = useState(false);
  const { isInstalled, isBannerDismissed, promptInstall, dismissBanner } = usePWAStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isInstalled || isBannerDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        aria-label="Install web application"
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[140] bg-[#141418]/95 backdrop-blur-md border border-brand-accent/30 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 text-brand-text"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-brand-accent/30 flex-shrink-0 bg-[#0f0f11]">
            <Image
              src="/icons/icon-192x192.png"
              alt="Slay by Humu"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-sm tracking-tight truncate">Slay by Humu App</span>
              <Sparkles className="w-3 h-3 text-brand-accent flex-shrink-0" />
            </div>
            <p className="text-[11px] text-brand-muted font-sans truncate">
              Install for instant luxury access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => promptInstall()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-accent to-[#AA7C11] text-[#0f0f11] font-sans font-bold text-xs rounded-xl shadow-soft hover:opacity-95 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            Install
          </button>
          <button
            onClick={dismissBanner}
            className="w-7 h-7 rounded-full bg-brand-text/5 hover:bg-brand-text/10 flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors"
            aria-label="Dismiss install banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
