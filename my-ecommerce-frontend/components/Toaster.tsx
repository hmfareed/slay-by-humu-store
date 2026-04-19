'use client';

import { useNotification } from '@/src/context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toaster() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4 pointer-events-none w-full max-w-sm sm:w-auto">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            layout
            className="pointer-events-auto"
          >
            <div className={`
              flex items-center gap-4 p-5 rounded-2xl shadow-luxury border backdrop-blur-xl
              ${n.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' : ''}
              ${n.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400' : ''}
              ${n.type === 'info' ? 'bg-brand-panel/90 border-brand-text/10 text-brand-text' : ''}
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
