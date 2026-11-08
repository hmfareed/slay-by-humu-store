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
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-8 space-y-6">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 rounded-2xl bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-4 w-64 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800/40 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-20 text-zinc-500 text-sm">Customer account not found.</div>;
  }

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    if (s === 'shipped') return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
    if (s === 'cancelled') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
    return 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Back Button */}
      <Link 
        href="/admin/customers" 
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#C5A059] active:scale-95 transition-all text-xs font-semibold uppercase tracking-wider"
      >
        <ArrowLeft size={14} /> Back to Client Directory
      </Link>

      {/* Profile Header */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-serif text-3xl font-bold text-[#C5A059] bg-zinc-900 dark:bg-zinc-800 border-2 border-[#C5A059]/30 overflow-hidden flex-shrink-0 shadow-sm">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">{user.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                user.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500'
              }`}>
                {user.isActive ? 'Active' : 'Disabled'}
              </span>
              {user.role === 'admin' && (
                <span className="bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5"><Mail size={13} className="text-[#C5A059]" /> {user.email}</span>
              {user.phone && <span className="flex items-center gap-1.5 font-mono tabular-nums"><Phone size={13} className="text-[#C5A059]" /> {user.phone}</span>}
              <span className="flex items-center gap-1.5 tabular-nums"><Calendar size={13} className="text-[#C5A059]" /> Member since {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {/* Actions */}
          {user.role !== 'admin' && (
            <div className="flex gap-2 flex-shrink-0 self-start">
              <button
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border active:scale-95 ${
                  user.isActive
                    ? 'border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/10'
                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/10'
                }`}
              >
                {user.isActive ? <><UserX size={14} /> Suspend</> : <><UserCheck size={14} /> Reinstate</>}
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/10 active:scale-95 transition-all"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: user.totalOrders, icon: ShoppingBag, isCurrency: false },
            { label: 'Total Expenditure', value: `₵${Number(user.totalSpent || 0).toLocaleString()}`, icon: DollarSign, isCurrency: true },
            { label: 'Saved Addresses', value: user.addresses?.length || 0, icon: MapPin, isCurrency: false },
            { label: 'Avg. Transaction', value: user.totalOrders > 0 ? `₵${Math.round(user.totalSpent / user.totalOrders).toLocaleString()}` : '₵0', icon: DollarSign, isCurrency: true },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="p-2.5 bg-[#C5A059]/10 text-[#C5A059] rounded-xl flex-shrink-0">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                  <p className={`text-base md:text-lg font-bold text-zinc-900 dark:text-white tabular-nums ${stat.isCurrency ? 'font-mono' : 'font-serif'}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column: Order History + Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order History */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/60">
            <h2 className="font-serif text-lg font-semibold text-zinc-900 dark:text-white">Order History</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Purchases initiated by this client</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold border-b border-zinc-100 dark:border-zinc-800/60">
                <tr>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {(!user.orders || user.orders.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 text-sm">
                      No order history recorded for this client.
                    </td>
                  </tr>
                ) : (
                  user.orders.map((order: any) => (
                    <tr key={order._id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-medium text-xs text-zinc-900 dark:text-white tabular-nums">
                        #{order._id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-zinc-500 tabular-nums">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-zinc-500">
                        {order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${statusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-mono font-semibold text-zinc-900 dark:text-white tabular-nums text-sm">
                        ₵{Number(order.totalAmount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/60">
            <h2 className="font-serif text-lg font-semibold text-zinc-900 dark:text-white">Shipping Profiles</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Recorded delivery locations</p>
          </div>
          <div className="p-6 space-y-3.5">
            {(!user.addresses || user.addresses.length === 0) ? (
              <p className="text-zinc-500 text-xs text-center py-6">No saved addresses on file.</p>
            ) : (
              user.addresses.map((addr: any) => (
                <div key={addr._id} className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex items-start gap-3">
                    <MapPin size={15} className="text-[#C5A059] mt-0.5 flex-shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-zinc-900 dark:text-white">{addr.name}</p>
                      <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">{addr.street}, {addr.city}</p>
                      <p className="text-zinc-500">{addr.region}</p>
                      {addr.phone && <p className="text-zinc-500 font-mono tabular-nums mt-1">📞 {addr.phone}</p>}
                      {addr.isDefault && (
                        <span className="mt-2 inline-block bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Primary
                        </span>
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
