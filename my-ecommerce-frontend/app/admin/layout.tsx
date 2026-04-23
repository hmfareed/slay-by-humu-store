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
  Search
} from 'lucide-react';

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
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
    
    try {
      // Basic jwt decode without library
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const user = JSON.parse(jsonPayload);
      if (user.role !== 'admin') {
        router.replace('/'); // Not authorized
      } else {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error(e);
      router.replace('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

  if (!isAdmin) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Verifying Admin Access...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0A0A0A] flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 "
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: isMobile ? '-100%' : 0 }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed md:relative flex flex-col w-72 h-screen z-50 transition-all 
          bg-white dark:bg-[#121212] border-r border-zinc-200 dark:border-zinc-800 shadow-xl md:shadow-none`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/admin" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 tracking-tight">
            Slay<span className="text-black dark:text-white">Admin</span>
          </Link>
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-zinc-500 hover:text-black dark:hover:text-white">
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            
            return (
              <Link key={link.name} href={link.href} onClick={() => isMobile && setIsSidebarOpen(false)}>
                <div className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Icon size={20} className={`mr-3 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-black dark:group-hover:text-white'}`} />
                  <span className="font-medium text-sm">{link.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium text-sm">Logout / Exit</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white dark:bg-black  border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 z-30 sticky top-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-4 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
            >
              <Menu size={24} />
            </button>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-4 py-2 border border-zinc-200 dark:border-zinc-800 focus-within:ring-2 ring-violet-500/50 transition-all">
              <Search size={18} className="text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none focus:outline-none text-sm ml-3 w-64 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 relative rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-black"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-[2px]">
              <div className="w-full h-full bg-white dark:bg-black rounded-full border-2 border-white dark:border-black overflow-hidden flex items-center justify-center">
                <span className="text-xs font-bold">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
        
      </main>
    </div>
  );
}
