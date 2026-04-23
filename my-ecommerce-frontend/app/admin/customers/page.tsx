'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, ShoppingBag, DollarSign, ToggleLeft, ToggleRight, Trash2, Eye, UserX, UserCheck, MoreVertical } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  avatar?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/${userId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: data.isActive } : u));
      }
    } catch (error) {
      console.error('Toggle error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${name}? This cannot be undone.`)) return;
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search))
  );

  const totalCustomers = users.filter(u => u.role === 'user').length;
  const activeCustomers = users.filter(u => u.role === 'user' && u.isActive).length;
  const disabledCustomers = users.filter(u => u.role === 'user' && !u.isActive).length;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Customers</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage and understand your registered users.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        {[
          { label: 'Total', value: totalCustomers, color: 'from-violet-500 to-fuchsia-500' },
          { label: 'Active', value: activeCustomers, color: 'from-emerald-500 to-teal-500' },
          { label: 'Disabled', value: disabledCustomers, color: 'from-rose-500 to-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-4 md:p-6 shadow-sm">
            <p className="text-[10px] md:text-sm uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            <p className="text-xl md:text-3xl font-bold text-zinc-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-4 flex items-center shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 ring-violet-500/50 transition-all text-zinc-800 dark:text-zinc-200"
          />
        </div>
      </div>

      {/* Mobile Card Layout (Visible only on small screens) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
          <div className="py-20 text-center text-zinc-500">Loading customers...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">No customers found.</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user._id} className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white overflow-hidden ${user.isActive === false ? 'bg-zinc-400' : 'bg-gradient-to-tr from-violet-500 to-fuchsia-500'}`}>
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    {user.name}
                    {user.role === 'admin' && <span className="text-[9px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-bold uppercase">Admin</span>}
                  </h3>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-100 dark:border-zinc-800/50 mb-4">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">Orders</p>
                  <p className="text-sm font-bold">{user.totalOrders || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">Spent</p>
                  <p className="text-sm font-bold">₵{(user.totalSpent || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                  user.isActive !== false ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'
                }`}>
                  {user.isActive !== false ? 'Active' : 'Disabled'}
                </span>
                <div className="flex gap-2">
                  <Link href={`/admin/customers/${user._id}`} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><Eye size={16} /></Link>
                  {user.role !== 'admin' && (
                    <>
                      <button onClick={() => handleToggleStatus(user._id)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                        {user.isActive !== false ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button onClick={() => handleDelete(user._id, user.name)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PC Table Layout (Hidden on small screens) */}
      <div className="hidden md:block bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Orders</th>
                <th className="px-6 py-4 font-medium">Total Spent</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center">Loading...</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white overflow-hidden ${user.isActive === false ? 'bg-zinc-400' : 'bg-gradient-to-tr from-violet-500 to-fuchsia-500'}`}>
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/admin/customers/${user._id}`} className="font-semibold text-zinc-900 dark:text-white hover:text-violet-600 transition-colors">
                            {user.name}
                          </Link>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{user.phone || '—'}</td>
                    <td className="px-6 py-4">{user.totalOrders || 0}</td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">₵{(user.totalSpent || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${user.isActive !== false ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                        {user.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/customers/${user._id}`} className="p-2 text-zinc-500 hover:text-violet-600 rounded-lg transition-colors"><Eye size={16} /></Link>
                        {user.role !== 'admin' && (
                          <>
                            <button onClick={() => handleToggleStatus(user._id)} className="p-2 text-zinc-500 hover:text-amber-600 rounded-lg"><UserX size={16} /></button>
                            <button onClick={() => handleDelete(user._id, user.name)} className="p-2 text-zinc-500 hover:text-rose-600 rounded-lg"><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
