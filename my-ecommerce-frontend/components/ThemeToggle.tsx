'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-12 h-6 rounded-full bg-brand-text/5" />;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isDark ? 'bg-brand-panel border border-brand-text/10' : 'bg-black/10'}`}
      aria-label="Toggle theme"
    >
      <div 
        className={`absolute w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-300 transform ${isDark ? 'translate-x-6 bg-brand-text' : 'translate-x-1 bg-white'}`}
      >
        {isDark 
          ? <Moon size={10} className="text-brand-panel fill-brand-panel" /> 
          : <Sun size={10} className="text-amber-500 fill-amber-500" />
        }
      </div>
    </button>
  );
}
