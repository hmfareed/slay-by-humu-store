'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-14 h-8 rounded-full" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-14 h-8 rounded-full focus:outline-none overflow-hidden touch-manipulation group flex-shrink-0"
      aria-label="Toggle theme"
    >
      <div className={`absolute inset-0 transition-colors duration-500 shadow-inner ${theme === 'dark' ? 'bg-brand-panel/80 border border-brand-text/10' : 'bg-black/5 border border-black/10'}`} />
      
      <motion.div
        animate={{
          x: theme === 'dark' ? 24 : 4,
          rotate: theme === 'dark' ? 360 : 0
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-all ${theme === 'dark' ? 'bg-brand-text border border-brand-bg/10' : 'bg-white'}`}
      >
        {theme === 'dark' 
          ? <Moon size={12} className="text-brand-panel fill-brand-panel" /> 
          : <Sun size={12} className="text-amber-500 fill-amber-500" />
        }
      </motion.div>
    </button>
  );
}
