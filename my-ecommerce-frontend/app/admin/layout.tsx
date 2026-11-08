'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Bell,
  Search,
  MessageSquare
} from 'lucide-react';
import { decodeToken, isTokenExpired } from '@/src/lib/jwt';

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if window is below md breakpoint
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setIsSidebarOpen(false);
      } else {
        setIsMobile(false);
        setIsSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Authorization check
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    if (isTokenExpired(token)) {
      console.warn('Admin token has expired. Redirecting to login.');
      localStorage.removeItem('token');
      router.replace('/login?expired=true');
      return;
    }
    
    try {
      const user = decodeToken(token);
      if (!user || user.role !== 'admin') {
        router.replace('/'); // Not authorized
      } else {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error(e);
      localStorage.removeItem('token');
      router.replace('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex flex-col items-center justify-center text-zinc-300 gap-3">
        <span className="w-6 h-6 border-2 border-[#C5A059]/30 border-t-[#C5A059] rounded-full animate-spin"></span>
        <span className="text-xs uppercase tracking-[0.2em] font-medium text-zinc-400">Verifying Admin Access...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0C0C0C] flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: isMobile ? '-100%' : 0 }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
        className="fixed md:relative flex flex-col w-72 h-screen z-50 transition-all 
          bg-white dark:bg-[#121212] border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-xl md:shadow-none"
      >
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <Link href="/admin" className="group flex flex-col">
            <span className="font-serif text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white group-hover:text-[#C5A059] transition-colors">
              Slay <span className="font-sans font-light text-zinc-400 dark:text-zinc-500">by</span> Humu
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C5A059] -mt-0.5">
              Atelier Admin
            </span>
          </Link>
          {isMobile && (
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="md:hidden text-zinc-500 hover:text-black dark:hover:text-white active:scale-95 transition-all p-1"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            const Icon = link.icon;
            
            return (
              <Link key={link.name} href={link.href} onClick={() => isMobile && setIsSidebarOpen(false)}>
                <div className={`flex items-center px-4 py-3 rounded-xl transition-all duration-150 group relative
                  ${isActive 
                    ? 'bg-zinc-900 text-white dark:bg-zinc-800/90 shadow-sm font-semibold' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#C5A059] rounded-r-full" />
                  )}
                  <Icon size={18} className={`mr-3 transition-colors ${isActive ? 'text-[#C5A059]' : 'text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'}`} />
                  <span className="text-sm">{link.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/60">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 active:scale-[0.98] transition-all duration-150"
          >
            <LogOut size={18} className="mr-3" />
            <span className="font-medium text-sm">Logout / Exit</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between px-6 z-30 sticky top-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-4 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 active:scale-95 transition-all"
            >
              <Menu size={22} />
            </button>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-zinc-100/80 dark:bg-zinc-900/80 rounded-xl px-4 py-2 border border-zinc-200 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-[#C5A059]/40 focus-within:border-[#C5A059]/60 transition-all">
              <Search size={16} className="text-zinc-400" />
              <input 
                type="text" 
                placeholder="Quick search across atelier..." 
                className="bg-transparent border-none focus:outline-none text-sm ml-3 w-64 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 font-sans"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 relative rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 active:scale-95 transition-all">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#C5A059] rounded-full border border-white dark:border-black"></span>
            </button>
            <div className="h-10 w-10 rounded-full ring-2 ring-[#C5A059]/30 p-[2px] bg-zinc-100 dark:bg-zinc-900">
              <div className="w-full h-full bg-zinc-900 dark:bg-zinc-800 rounded-full overflow-hidden flex items-center justify-center text-zinc-100 shadow-sm">
                <span className="text-xs font-serif font-bold tracking-wider text-[#C5A059]">SH</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
        
      </main>
    </div>
  );
}
