'use client';

import { useNotification } from '@/src/context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toaster() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 sm:px-0">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            layout
            className="pointer-events-auto"
          >
            <div className={`
              flex items-center gap-4 p-4 rounded-2xl shadow-2xl border 
              ${n.type === 'success' ? 'bg-[#101010] border-green-500/30 text-white' : ''}
              ${n.type === 'error' ? 'bg-[#101010] border-red-500/30 text-white' : ''}
              ${n.type === 'info' ? 'bg-brand-panel border-brand-text/10 text-brand-text' : ''}
            `}>
              <div className="flex-shrink-0">
                {n.type === 'success' && <CheckCircle className="w-6 h-6" />}
                {n.type === 'error' && <AlertCircle className="w-6 h-6" />}
                {n.type === 'info' && <Info className="w-6 h-6" />}
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-sans font-medium tracking-tight leading-snug">
                  {n.message}
                </p>
              </div>

              <button 
                onClick={() => removeNotification(n.id)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
