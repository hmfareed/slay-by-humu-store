'use client';

import { useState } from 'react';
import { Image as ImageIcon, RefreshCw } from 'lucide-react';
import { getOptimizedCloudinaryUrl, getOptimizedImageUrl } from '@/src/lib/images';

export { getOptimizedCloudinaryUrl };

interface ProductThumbnailProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  badge?: string;
}

export default function ProductThumbnail({
  src,
  name = 'Product',
  size = 'sm',
  className = '',
  badge,
}: ProductThumbnailProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12 rounded-xl',
    md: 'w-14 h-14 rounded-xl',
    lg: 'w-20 h-20 rounded-2xl',
    xl: 'w-28 h-28 rounded-2xl',
    full: 'w-full h-full rounded-xl',
  }[size];

  const iconSizes = {
    sm: 18,
    md: 20,
    lg: 26,
    xl: 32,
    full: 28,
  }[size];

  // If no source provided at all, render static placeholder
  if (!src) {
    return (
      <div
        className={`${sizeClasses} ${className} bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col items-center justify-center flex-shrink-0 text-zinc-400 dark:text-zinc-500 overflow-hidden select-none relative`}
        title={name}
      >
        <ImageIcon size={iconSizes} strokeWidth={1.5} />
      </div>
    );
  }

  // Primary URL is same-origin Next.js image proxy (solves IPv6 dual-stack stalls)
  // Fallback URL is the directly optimized Cloudinary URL
  const primaryUrl = getOptimizedImageUrl(src, 256);
  const fallbackUrl = getOptimizedCloudinaryUrl(src, 160, 160);
  const activeUrl = useFallback ? fallbackUrl : primaryUrl;

  const handleImageError = () => {
    if (!useFallback) {
      // Try direct Cloudinary URL if proxy had an issue
      setUseFallback(true);
    } else {
      setHasError(true);
    }
  };

  const handleManualReload = () => {
    setHasError(false);
    setUseFallback(false);
    setIsLoaded(false);
  };

  if (hasError) {
    return (
      <div
        onClick={handleManualReload}
        className={`${sizeClasses} ${className} bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col items-center justify-center flex-shrink-0 text-zinc-400 dark:text-zinc-500 overflow-hidden select-none relative cursor-pointer hover:border-[#C5A059]/60 hover:text-[#C5A059] transition-colors group`}
        title={`${name} (Click to reload)`}
      >
        <ImageIcon size={iconSizes} strokeWidth={1.5} className="group-hover:hidden" />
        <RefreshCw size={iconSizes - 2} className="hidden group-hover:block animate-spin" />
        {badge && (
          <span className="absolute bottom-1 px-1 py-0.2 text-[8px] font-bold tracking-tight bg-[#C5A059] text-black rounded uppercase">
            {badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative ${sizeClasses} ${className} bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden flex-shrink-0 flex items-center justify-center select-none`}
      title={name}
    >
      {/* Subtle pulse skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 animate-pulse z-0" />
      )}

      <img
        src={activeUrl}
        alt={name}
        loading="lazy"
        ref={(el) => {
          if (el && el.complete && el.naturalWidth > 0 && !isLoaded) {
            setIsLoaded(true);
          }
        }}
        onLoad={() => setIsLoaded(true)}
        onError={handleImageError}
        className="w-full h-full object-cover z-10"
      />

      {/* Optional badge overlay */}
      {badge && (
        <div className="absolute top-1 left-1 z-20">
          <span className="px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase bg-black/75 backdrop-blur-sm text-[#C5A059] rounded border border-[#C5A059]/30">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}
