'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, UserX, UserCheck, Trash2, AlertCircle, RefreshCw, CheckCircle2, X } from 'lucide-react';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // System popup state (no browser confirm/alert)
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
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
        setUsers([]);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setErrorMessage(data.message || 'Failed to load customers');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Network error while connecting to server. Please check backend connection.');
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
        showToast('success', `Client status updated to ${data.isActive ? 'Active' : 'Disabled'}.`);
      } else {
        showToast('error', 'Failed to update client status');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      showToast('error', 'Network error while updating status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirmed = async (userId: string, name: string) => {
    setIsDeletingUser(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
        setUserToDelete(null);
        showToast('success', `Client account for ${name} has been permanently deleted.`);
      } else {
        const data = await res.json();
        showToast('error', data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('error', 'Network error while deleting user');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.phone && u.phone.includes(search))
  );

  const totalCustomers = users.filter(u => u.role === 'user').length;
  const activeCustomers = users.filter(u => u.role === 'user' && u.isActive).length;
  const disabledCustomers = users.filter(u => u.role === 'user' && !u.isActive).length;

  return (
    <div className="space-y-8 pb-12 relative">
      {/* In-App Floating Toast Notification (System Popup) */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[300] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold uppercase tracking-wider backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-[#C5A059]/40'
                : 'bg-rose-950/95 text-rose-200 border-rose-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 size={16} className="text-[#C5A059] flex-shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)} 
              className="ml-2 p-1 text-zinc-400 hover:text-white dark:hover:text-zinc-900 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Client Directory
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Review registered clientele, order histories, and membership permissions.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:border-[#C5A059] hover:text-[#C5A059] active:scale-[0.98] transition-all duration-150 shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#C5A059]' : ''} />
          Refresh Clients
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
            onClick={fetchUsers}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        {[
          { label: 'Total Clients', value: totalCustomers, sub: 'Registered users' },
          { label: 'Active Accounts', value: activeCustomers, sub: 'In good standing' },
          { label: 'Restricted', value: disabledCustomers, sub: 'Access suspended' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 md:p-6 shadow-sm hover:border-[#C5A059]/40 transition-colors">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 font-sans">{stat.label}</p>
            <p className="font-serif text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tabular-nums tracking-tight mt-1">{stat.value}</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 flex items-center shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search by client name, email, or telephone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]/60 transition-all text-zinc-800 dark:text-zinc-200 text-sm font-sans"
          />
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-3 w-40 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
                  </div>
                </div>
                <div className="h-12 bg-zinc-100 dark:bg-zinc-800/40 rounded-xl"></div>
              </div>
            ))}
          </>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-sm">No customers match your query.</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user._id} className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-serif font-bold text-[#C5A059] bg-zinc-900 dark:bg-zinc-800 border border-[#C5A059]/30 overflow-hidden flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" />
                  ) : (
                    (user.name || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2 text-sm truncate">
                    {user.name}
                    {user.role === 'admin' && (
                      <span className="text-[9px] bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Admin
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-zinc-100 dark:border-zinc-800/60 mb-3.5">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">Orders</p>
                  <p className="text-sm font-mono font-semibold tabular-nums text-zinc-900 dark:text-white mt-0.5">
                    {user.totalOrders || 0}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">Spent</p>
                  <p className="text-sm font-mono font-semibold tabular-nums text-zinc-900 dark:text-white mt-0.5">
                    ₵{Number(user.totalSpent || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  user.isActive !== false ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500'
                }`}>
                  {user.isActive !== false ? 'Active' : 'Disabled'}
                </span>
                <div className="flex gap-1.5">
                  <Link 
                    href={`/admin/customers/${user._id}`} 
                    className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:text-[#C5A059] active:scale-95 rounded-lg transition-colors"
                  >
                    <Eye size={15} />
                  </Link>
                  {user.role !== 'admin' && (
                    <>
                      <button 
                        onClick={() => handleToggleStatus(user._id)} 
                        disabled={actionLoading === user._id}
                        className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:text-amber-600 active:scale-95 rounded-lg transition-colors"
                      >
                        {user.isActive !== false ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                      <button 
                        onClick={() => setUserToDelete({ id: user._id, name: user.name })} 
                        disabled={actionLoading === user._id}
                        className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white active:scale-95 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PC Table Layout */}
      <div className="hidden md:block bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold border-b border-zinc-100 dark:border-zinc-800/60">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading ? (
                // 5-row structured skeleton loader
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                          <div className="space-y-1.5">
                            <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                            <div className="h-3 w-36 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-7 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 text-sm">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-sm text-[#C5A059] bg-zinc-900 dark:bg-zinc-800 border border-[#C5A059]/30 overflow-hidden flex-shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} className="w-full h-full object-cover" />
                          ) : (
                            (user.name || '?').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <Link 
                            href={`/admin/customers/${user._id}`} 
                            className="font-semibold text-zinc-900 dark:text-white hover:text-[#C5A059] transition-colors flex items-center gap-2"
                          >
                            {user.name}
                            {user.role === 'admin' && (
                              <span className="text-[9px] bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
                                Admin
                              </span>
                            )}
                          </Link>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                      {user.phone || '—'}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm tabular-nums text-zinc-900 dark:text-white">
                      {user.totalOrders || 0}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-sm tabular-nums text-zinc-900 dark:text-white">
                      ₵{Number(user.totalSpent || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${
                        user.isActive !== false ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500'
                      }`}>
                        {user.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-zinc-500">
                        <Link 
                          href={`/admin/customers/${user._id}`} 
                          className="p-2 text-zinc-500 hover:text-[#C5A059] hover:bg-[#C5A059]/10 rounded-lg active:scale-95 transition-all"
                          title="View Profile"
                        >
                          <Eye size={15} />
                        </Link>
                        {user.role !== 'admin' && (
                          <>
                            <button 
                              onClick={() => handleToggleStatus(user._id)} 
                              disabled={actionLoading === user._id}
                              className="p-2 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg active:scale-95 transition-all"
                              title={user.isActive !== false ? 'Disable account' : 'Enable account'}
                            >
                              {user.isActive !== false ? <UserX size={15} /> : <UserCheck size={15} />}
                            </button>
                            <button 
                              onClick={() => setUserToDelete({ id: user._id, name: user.name })} 
                              disabled={actionLoading === user._id}
                              className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg active:scale-95 transition-all"
                              title="Delete permanently"
                            >
                              <Trash2 size={15} />
                            </button>
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

      {/* Client Deletion Confirmation Dialog (System Modal Popup) */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeletingUser && setUserToDelete(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-[#121212] rounded-2xl p-7 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4 mx-auto text-rose-600">
                <Trash2 size={22} />
              </div>
              <div className="text-center mb-6">
                <h3 className="font-serif text-xl font-bold text-zinc-900 dark:text-white mb-2">Delete Client Account?</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                  Are you sure you want to permanently erase the client account for <span className="font-semibold text-zinc-900 dark:text-white">"{userToDelete.name}"</span>?
                </p>
                <p className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-2.5">
                  ⚠️ This will permanently remove their access and client credentials.
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => handleDeleteConfirmed(userToDelete.id, userToDelete.name)}
                  disabled={isDeletingUser}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                >
                  {isDeletingUser ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Deleting Client...
                    </>
                  ) : (
                    'Yes, Delete Client'
                  )}
                </button>
                <button
                  onClick={() => setUserToDelete(null)}
                  disabled={isDeletingUser}
                  className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] text-zinc-900 dark:text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  No, Keep Client
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
