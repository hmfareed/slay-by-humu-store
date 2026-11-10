'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, PlusSquare, Download, Laptop, Smartphone, Sparkles } from 'lucide-react';
import { usePWAStore } from '@/src/store/pwaStore';

export default function InstallModal() {
  const { isModalOpen, closeModal, platform, promptInstall, isInstalled, deferredPrompt } = usePWAStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  const isIOS = platform === 'ios';
  const isMacOS = platform === 'macos-safari';
  const hasDirectPrompt = Boolean(deferredPrompt);
  const shouldShow = isModalOpen && !isInstalled;

  return (
    <AnimatePresence>
      {shouldShow && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-[#141418] border border-brand-accent/20 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden text-brand-text"
          >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-brand-text/5 hover:bg-brand-text/10 flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-brand-accent/30 shadow-soft flex-shrink-0 bg-[#0f0f11]">
              <Image
                src="/icons/icon-192x192.png"
                alt="Slay by Humu"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold tracking-tight text-brand-text">Install Slay by Humu</h3>
                <Sparkles className="w-4 h-4 text-brand-accent" />
              </div>
              <p className="text-xs text-brand-muted font-sans mt-0.5">
                Elevated shopping on your home screen
              </p>
            </div>
          </div>

          {/* Platform-Specific Content */}
          {isIOS ? (
            <div className="space-y-4">
              <div className="bg-brand-text/[0.03] border border-brand-text/5 rounded-2xl p-4 text-xs font-sans text-brand-muted leading-relaxed">
                Install our Progressive Web App on iPhone or iPad via Safari for the smoothest full-screen luxury shopping experience.
              </div>

              <div className="space-y-3 font-sans text-sm">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-brand-panel border border-brand-text/5">
                  <div className="w-8 h-8 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-brand-text">Step 1:</span>
                    <p className="text-xs text-brand-muted mt-0.5">
                      Tap the <strong className="text-brand-accent font-semibold">Share</strong> button in Safari's bottom toolbar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-brand-panel border border-brand-text/5">
                  <div className="w-8 h-8 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-brand-text">Step 2:</span>
                    <p className="text-xs text-brand-muted mt-0.5">
                      Scroll down and tap <strong className="text-brand-accent font-semibold">"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-brand-panel border border-brand-text/5">
                  <div className="w-8 h-8 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-brand-text">Step 3:</span>
                    <p className="text-xs text-brand-muted mt-0.5">
                      Tap <strong className="text-brand-accent font-semibold">"Add"</strong> in the top right corner to complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : isMacOS ? (
            <div className="space-y-4">
              <div className="bg-brand-text/[0.03] border border-brand-text/5 rounded-2xl p-4 text-xs font-sans text-brand-muted leading-relaxed">
                Add Slay by Humu to your Mac Dock in Safari for standalone window shopping.
              </div>

              <div className="space-y-3 font-sans text-sm">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-brand-panel border border-brand-text/5">
                  <div className="w-8 h-8 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-brand-text">Step 1:</span>
                    <p className="text-xs text-brand-muted mt-0.5">
                      Click <strong className="text-brand-accent font-semibold">File</strong> in the macOS menu bar at the top of your screen.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-brand-panel border border-brand-text/5">
                  <div className="w-8 h-8 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-brand-text">Step 2:</span>
                    <p className="text-xs text-brand-muted mt-0.5">
                      Select <strong className="text-brand-accent font-semibold">"Add to Dock..."</strong> and click Add.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm font-sans text-brand-muted leading-relaxed">
                Enjoy instant launching, full-screen browsing without browser bars, and faster performance directly from your home screen or desktop.
              </p>

              {hasDirectPrompt ? (
                <button
                  onClick={async () => {
                    await promptInstall();
                    closeModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-brand-accent to-[#AA7C11] text-[#0f0f11] font-sans font-bold text-sm rounded-2xl shadow-soft hover:opacity-95 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Install Now
                </button>
              ) : (
                <div className="bg-brand-text/[0.03] border border-brand-text/5 rounded-2xl p-4 text-xs font-sans text-brand-muted">
                  To install, look for the install icon in your browser's address bar or menu, and select <strong className="text-brand-accent">"Install App"</strong>.
                </div>
              )}
            </div>
          )}

          {/* Dismiss button */}
          <button
            onClick={closeModal}
            className="w-full mt-5 py-3 text-xs font-sans font-medium text-brand-muted hover:text-brand-text transition-colors text-center"
          >
            Close
          </button>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
