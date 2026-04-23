'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { API_URL } from '@/src/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      setIsOpen(true);
      try {
        const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      }
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-sm hidden md:block" ref={containerRef}>
      <div className="relative group">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          className="w-full bg-brand-text/5 border border-brand-text/10 rounded-full pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent focus:bg-transparent transition-all placeholder-brand-muted"
        />
        <Search className="w-4 h-4 text-brand-muted absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-accent transition-colors" />
        {loading && (
          <Loader2 className="w-4 h-4 text-brand-accent absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
        )}
      </div>

      {isOpen && (query.trim().length > 0) && (
        <div
          className="absolute top-full left-0 w-full mt-2 bg-brand-panel border border-brand-text/10 rounded-2xl shadow-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Products
              </div>
              {results.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product._id}`}
                  onClick={() => { setIsOpen(false); setQuery(''); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-brand-text/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-bg flex-shrink-0">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-text/10" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-text truncate">{product.name}</p>
                    <p className="text-xs text-brand-muted font-sans">₵{product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
              <Link
                href={`/products?search=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="block text-center py-3 text-sm text-brand-accent hover:bg-brand-text/5 transition-colors font-medium border-t border-brand-text/5"
              >
                View all results
              </Link>
            </div>
          ) : !loading ? (
            <div className="p-6 text-center">
              <p className="text-sm text-brand-muted">No products found for "{query}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
