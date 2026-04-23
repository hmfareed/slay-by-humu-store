'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/src/lib/api';
import { ArrowLeft, Mail, Phone, Calendar, MapPin, ShoppingBag, DollarSign, UserX, UserCheck, Trash2 } from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  orders: any[];
  addresses: any[];
}

export default function CustomerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUser(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/${user._id}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, isActive: data.isActive });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/${user._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        router.push('/admin/customers');
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-20 text-zinc-500">User not found.</div>;
  }

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400';
    if (s === 'shipped') return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400';
    if (s === 'cancelled') return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400';
    return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400';
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      {/* Profile Header */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white overflow-hidden ${user.isActive ? 'bg-gradient-to-tr from-violet-500 to-fuchsia-500' : 'bg-zinc-400'}`}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{user.name}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                user.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500'
              }`}>
                {user.isActive ? 'Active' : 'Disabled'}
              </span>
              {user.role === 'admin' && (
                <span className="bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Admin</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
              {user.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {user.phone}</span>}
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {/* Actions */}
          {user.role !== 'admin' && (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                  user.isActive
                    ? 'border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/10'
                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/10'
                }`}
              >
                {user.isActive ? <><UserX size={16} /> Disable</> : <><UserCheck size={16} /> Enable</>}
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: user.totalOrders, icon: ShoppingBag },
            { label: 'Total Spent', value: `₵${user.totalSpent.toLocaleString()}`, icon: DollarSign },
            { label: 'Addresses', value: user.addresses.length, icon: MapPin },
            { label: 'Avg. Order', value: user.totalOrders > 0 ? `₵${Math.round(user.totalSpent / user.totalOrders).toLocaleString()}` : '₵0', icon: DollarSign },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="p-2 bg-violet-50 dark:bg-violet-500/10 rounded-xl">
                  <Icon size={18} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column: Order History + Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order History */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Order History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Order ID</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Items</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {user.orders.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No orders yet.</td></tr>
                ) : (
                  user.orders.map((order: any) => (
                    <tr key={order._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-3 font-medium text-zinc-900 dark:text-white">#{order._id.substring(0, 8)}</td>
                      <td className="px-6 py-3 text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-3 text-zinc-500">{order.items?.length || 0} items</td>
                      <td className="px-6 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${statusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-zinc-900 dark:text-white">₵{order.totalAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Saved Addresses</h2>
          </div>
          <div className="p-6 space-y-4">
            {user.addresses.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">No saved addresses.</p>
            ) : (
              user.addresses.map((addr: any) => (
                <div key={addr._id} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-violet-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-zinc-900 dark:text-white">{addr.name}</p>
                      <p className="text-zinc-500">{addr.street}, {addr.city}</p>
                      <p className="text-zinc-500">{addr.region}</p>
                      {addr.phone && <p className="text-zinc-500 mt-1">📞 {addr.phone}</p>}
                      {addr.isDefault && (
                        <span className="mt-2 inline-block bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Default</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
