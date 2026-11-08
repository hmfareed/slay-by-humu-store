'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Lazy load charting libraries to prevent layout blocking and improve speed
const RevenueChart = dynamic(() => import('@/components/admin/RevenueChart'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full animate-pulse bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl" /> 
});
const OrdersChart = dynamic(() => import('@/components/admin/OrdersChart'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full animate-pulse bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl" /> 
});

import { Package, Users, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { API_URL } from '@/src/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6m');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      setErrorMessage(null);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(`${API_URL}/admin/stats?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        setErrorMessage('Your session has expired. Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login?expired=true';
        }, 1200);
        return;
      }

      if (res.status === 403) {
        setErrorMessage('Access denied: You are not authorized as an administrator.');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setErrorMessage(data.message || 'Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setErrorMessage('Network error while connecting to server. Please check backend connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchStats();
  };

  const statusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    }
    if (s === 'pending') {
      return 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30';
    }
    if (s === 'cancelled') {
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
    }
    return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700';
  };

  if (loading && !refreshing) {
    return (
      <div className="space-y-8 pb-10">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div>
            <div className="h-8 w-44 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
            <div className="h-4 w-72 bg-zinc-100 dark:bg-zinc-800/60 rounded-md mt-2"></div>
          </div>
          <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        </div>

        {/* 4 KPI Skeletons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 md:p-6 shadow-sm animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="h-7 w-28 bg-zinc-300 dark:bg-zinc-700 rounded-lg"></div>
                  <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm animate-pulse">
            <div className="h-6 w-28 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
            <div className="h-64 md:h-80 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-xl"></div>
          </div>
          <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm animate-pulse">
            <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
            <div className="h-64 md:h-80 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-xl"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
          <div className="h-6 w-36 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    { 
      title: 'Total Revenue', 
      value: `₵${(stats?.totalRevenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      subtext: 'Gross revenue to date'
    },
    { 
      title: 'Total Orders', 
      value: (stats?.totalOrders || 0).toLocaleString(), 
      icon: ShoppingCart, 
      subtext: 'Lifetime orders placed'
    },
    { 
      title: 'Active Customers', 
      value: (stats?.totalCustomers || 0).toLocaleString(), 
      icon: Users, 
      subtext: 'Registered clients'
    },
    { 
      title: 'Low Stock Items', 
      value: stats?.lowStockCount || 0, 
      icon: Package, 
      subtext: 'Inventory reorder alerts'
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Overview
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Real-time atelier performance and store activity summary.
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:border-[#C5A059] hover:text-[#C5A059] active:scale-[0.98] transition-all duration-150 shadow-sm"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#C5A059]' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Feed'}
        </button>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-700 dark:text-rose-400">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 md:p-6 shadow-sm hover:border-[#C5A059]/40 transition-all duration-200 relative group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-sans">
                    {kpi.title}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold font-serif text-zinc-900 dark:text-white tabular-nums tracking-tight pt-1">
                    {kpi.value}
                  </h3>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 pt-0.5">
                    {kpi.subtext}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#C5A059]/10 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-white transition-colors duration-200 flex-shrink-0">
                  <Icon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-semibold text-zinc-900 dark:text-white">Revenue Trajectory</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Total sales volume over selected horizon</p>
            </div>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-zinc-800 dark:text-zinc-200 font-medium"
            >
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="2w">2 Weeks</option>
              <option value="1m">1 Month</option>
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
            </select>
          </div>
          <div className="h-64 md:h-80 w-full">
            <RevenueChart data={stats?.salesTrend || []} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-serif text-lg font-semibold text-zinc-900 dark:text-white">Order Frequency</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Distribution across periods</p>
          </div>
          <div className="h-64 md:h-80 w-full">
            <OrdersChart data={stats?.salesTrend || []} />
          </div>
        </div>
      </div>
      
      {/* Recent Orders Section */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center">
          <div>
            <h3 className="font-serif text-lg font-semibold text-zinc-900 dark:text-white">Recent Transactions</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Latest customer purchases across the boutique</p>
          </div>
          <Link 
            href="/admin/orders" 
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#C5A059] hover:text-[#b08d4b] uppercase tracking-wider active:scale-95 transition-all"
          >
            All Orders <ChevronRight size={14} />
          </Link>
        </div>
        
        {/* Mobile Cards for Recent Orders */}
        <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((order: any) => (
            <div key={order._id} className="p-4 flex justify-between items-center hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
              <div>
                <p className="font-mono text-xs font-bold text-zinc-900 dark:text-white tabular-nums">#{order._id.substring(0, 8)}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5 tabular-nums">
                  {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white tabular-nums">₵{Number(order.totalAmount || 0).toLocaleString()}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${statusBadge(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-zinc-500 text-sm">No recent transactions recorded.</div>
          )}
        </div>

        {/* PC Table for Recent Orders */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold border-b border-zinc-100 dark:border-zinc-800/60">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Date & Time</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((order: any) => (
                <tr key={order._id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-xs text-zinc-900 dark:text-white tabular-nums">
                    #{order._id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-zinc-900 dark:text-white tabular-nums">
                    ₵{Number(order.totalAmount || 0).toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-zinc-500 text-sm">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
