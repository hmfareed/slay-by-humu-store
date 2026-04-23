'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Lazy load charting libraries to prevent layout blocking and improve speed
const RevenueChart = dynamic(() => import('@/components/admin/RevenueChart'), { ssr: false, loading: () => <div className="w-full h-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div> });
const OrdersChart = dynamic(() => import('@/components/admin/OrdersChart'), { ssr: false, loading: () => <div className="w-full h-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div> });
import { Package, Users, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { API_URL } from '@/src/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        ))}
      </div>
    );
  }

  const kpis = [
    { title: 'Total Revenue', value: `₵${stats?.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, trend: '+12.5%', isUp: true, color: 'from-emerald-400 to-teal-500' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, trend: '+5.2%', isUp: true, color: 'from-violet-400 to-fuchsia-500' },
    { title: 'Total Customers', value: stats?.totalCustomers || 0, icon: Users, trend: '+18.1%', isUp: true, color: 'from-blue-400 to-cyan-500' },
    { title: 'Low Stock Alerts', value: stats?.lowStockCount || 0, icon: Package, trend: '-2.4%', isUp: false, color: 'from-rose-400 to-red-500' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track your store's performance and recent activities.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-3xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className={`absolute -right-6 -top-6 w-20 h-20 bg-gradient-to-br ${kpi.color} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`} />
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] md:text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{kpi.title}</p>
                  <h3 className="text-xl md:text-3xl font-bold mt-1 text-zinc-900 dark:text-white">{kpi.value}</h3>
                </div>
                <div className={`p-2 md:p-3 rounded-2xl bg-gradient-to-br ${kpi.color} bg-opacity-10 text-white shadow-sm self-start`}>
                  <Icon size={18} className="md:w-5 md:h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Revenue</h3>
            <select className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded-xl px-2 py-1.5 focus:outline-none">
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-64 md:h-80 w-full">
              <RevenueChart data={stats?.salesTrend || []} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Orders</h3>
          <div className="h-64 md:h-80 w-full">
              <OrdersChart data={stats?.salesTrend || []} />
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Orders</h3>
        </div>
        
        {/* Mobile Cards for Recent Orders */}
        <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((order: any) => (
            <div key={order._id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-zinc-900 dark:text-white text-sm">#{order._id.substring(0, 8)}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-zinc-900 dark:text-white text-sm">₵{order.totalAmount}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  order.status === 'Completed' || order.status === 'Delivered' ? 'text-emerald-500 bg-emerald-500/10' : 
                  order.status === 'Pending' ? 'text-amber-500 bg-amber-500/10' : 
                  'text-blue-500 bg-blue-500/10'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-zinc-500">No recent orders.</div>
          )}
        </div>

        {/* PC Table for Recent Orders */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((order: any) => (
                <tr key={order._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">#{order._id.substring(0, 8)}</td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      order.status === 'Completed' || order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                      order.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-white">₵{order.totalAmount}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No recent orders.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
