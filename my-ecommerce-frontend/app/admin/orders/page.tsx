'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package, MapPin, CreditCard, User, Calendar, AlertTriangle, AlertCircle, RefreshCw, Eye } from 'lucide-react';

interface Order {
  _id: string;
  user: { _id: string; name: string; email: string; phone?: string };
  items: { product: any; quantity: number; price: number }[];
  shippingAddress: { address: string; city: string; country: string; postalCode: string; phoneNumber?: string };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

const STATUS_TABS = ['all', 'pending', 'processing', 'shipped', 'picked_up', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const res = await fetch(`${API_URL}/orders/all?${params.toString()}`, {
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
        setOrders([]);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setErrorMessage(data.message || 'Failed to load orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setErrorMessage('Network error while connecting to server. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, fromDate, toDate]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status: newStatus.toLowerCase() } : order
        ));
        // Update the detail drawer if it's showing this order
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus.toLowerCase() });
        }
      } else {
        const errorData = await res.json();
        alert(`Failed to update status: ${errorData.message}`);
        console.error('Failed to update status:', errorData);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Network error while updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
        }
        setOrderToCancel(null);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to cancel');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteAllOrders = async () => {
    if (window.confirm('Are you absolutely sure you want to delete ALL orders? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/orders/all`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setOrders([]);
          alert('All orders have been deleted.');
        } else {
          const data = await res.json();
          alert(data.message || 'Failed to delete orders');
        }
      } catch (error) {
        console.error(error);
        alert('Network error while deleting orders');
      }
    }
  };

  const filteredOrders = orders.filter(o =>
    (o._id || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.user && o.user.name?.toLowerCase().includes(search.toLowerCase())) ||
    (o.shippingAddress?.address && o.shippingAddress.address.toLowerCase().includes(search.toLowerCase()))
  );

  const statusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    if (s === 'picked_up') return 'bg-emerald-600 text-white border border-emerald-700';
    if (s === 'shipped') return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
    if (s === 'processing') return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20';
    if (s === 'cancelled') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
    return 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30';
  };

  const paymentBadge = (ps: string) => {
    const s = (ps || '').toLowerCase();
    if (s === 'paid') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    if (s === 'refunded') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
    return 'bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Orders Ledger
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Track, verify, and fulfill client transactions across Ghana and worldwide.
          </p>
        </div>
        <button 
          onClick={handleDeleteAllOrders}
          className="bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 flex items-center gap-2 active:scale-[0.98] self-start sm:self-auto"
        >
          <AlertTriangle size={15} />
          Purge Orders
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
            onClick={fetchOrders}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-zinc-600 dark:text-zinc-400 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isSelected = statusFilter === tab;
          const count = orders.filter(o => tab === 'all' || o.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-all duration-150 capitalize whitespace-nowrap active:scale-95 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm border border-zinc-900 dark:border-zinc-100 font-semibold'
                  : 'bg-white dark:bg-[#121212] text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-[#C5A059]/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.replace('_', ' ')}</span>
              {tab !== 'all' && (
                <span className={`font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-zinc-700 text-zinc-200 dark:bg-zinc-300 dark:text-zinc-800' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search by Order ID or Client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]/60 transition-all text-zinc-800 dark:text-zinc-200 text-sm font-sans"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 text-zinc-700 dark:text-zinc-300 font-mono"
            placeholder="From"
          />
          <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 text-zinc-700 dark:text-zinc-300 font-mono"
            placeholder="To"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold border-b border-zinc-100 dark:border-zinc-800/60">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading ? (
                // 5-row skeleton loader matching exact table columns to eliminate CLS
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5"></div>
                        <div className="h-3 w-36 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-7 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-7 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 text-sm">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors group">
                    <td className="px-6 py-4 font-mono font-medium text-xs text-zinc-900 dark:text-white tabular-nums">
                      #{order._id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-white text-sm">{order.user?.name || 'Guest Checkout'}</p>
                      <p className="text-xs text-zinc-500">{order.user?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-600 dark:text-zinc-400 tabular-nums">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-zinc-900 dark:text-white tabular-nums">
                      ₵{Number(order.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${paymentBadge(order.paymentStatus || 'unpaid')}`}>
                        {order.paymentStatus || 'unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {updatingId === order._id ? (
                        <span className="text-xs text-[#C5A059] font-medium flex items-center gap-1.5">
                          <span className="w-3 h-3 border-2 border-[#C5A059]/30 border-t-[#C5A059] rounded-full animate-spin"></span>
                          Updating...
                        </span>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-3 py-1.5 focus:outline-none cursor-pointer capitalize transition-all ${statusBadge(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="picked_up">Picked Up</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-zinc-600 dark:text-zinc-400">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-[#C5A059] hover:bg-[#C5A059]/10 rounded-lg active:scale-95 transition-all duration-150 inline-flex items-center gap-1"
                        >
                          <Eye size={13} /> View
                        </button>
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <button
                            onClick={() => setOrderToCancel(order._id)}
                            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg active:scale-95 transition-all duration-150"
                          >
                            Cancel
                          </button>
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

      {/* Order Detail Slide-Out Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-[#121212] z-[101] shadow-2xl overflow-y-auto border-l border-zinc-200 dark:border-zinc-800"
            >
              <div className="sticky top-0 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md z-10 p-6 border-b border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-zinc-900 dark:text-white">Order Details</h2>
                  <p className="font-mono text-xs text-zinc-500 tabular-nums mt-0.5">#{selectedOrder._id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl active:scale-95 transition-all text-zinc-500"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/60">
                  <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <User size={13} className="text-[#C5A059]" /> Client Profile
                  </h3>
                  <p className="font-medium text-zinc-900 dark:text-white text-sm">{selectedOrder.user?.name || 'Guest'}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{selectedOrder.user?.email || 'N/A'}</p>
                  {selectedOrder.user?.phone && (
                    <p className="text-xs text-zinc-500 font-mono mt-0.5 tabular-nums">{selectedOrder.user.phone}</p>
                  )}
                </div>

                {/* Products Ordered */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Package size={13} className="text-[#C5A059]" /> Purchased Items ({selectedOrder.items.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800/60">
                        <div className="w-14 h-14 rounded-xl bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                          {item.product?.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400"><Package size={20} /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-zinc-900 dark:text-white text-sm truncate">{item.product?.name || 'Product'}</p>
                          <p className="text-xs text-zinc-500 font-mono tabular-nums mt-0.5">
                            Qty: {item.quantity} × ₵{item.price}
                          </p>
                        </div>
                        <p className="font-mono font-semibold text-zinc-900 dark:text-white text-sm tabular-nums">
                          ₵{(item.quantity * item.price).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Payable</span>
                    <span className="font-serif text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">
                      ₵{Number(selectedOrder.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/60">
                  <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <MapPin size={13} className="text-[#C5A059]" /> Delivery Destination
                  </h3>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">{selectedOrder.shippingAddress?.address}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}</p>
                  {selectedOrder.shippingAddress?.postalCode && (
                    <p className="text-xs text-zinc-500 font-mono tabular-nums">{selectedOrder.shippingAddress.postalCode}</p>
                  )}
                  {selectedOrder.shippingAddress?.phoneNumber && (
                    <p className="text-xs font-mono font-medium text-zinc-900 dark:text-zinc-300 mt-2 flex items-center gap-1.5 tabular-nums">
                      📞 {selectedOrder.shippingAddress.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Payment & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/60">
                    <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CreditCard size={13} className="text-[#C5A059]" /> Payment Method
                    </h3>
                    <p className="font-semibold text-zinc-900 dark:text-white text-xs">{selectedOrder.paymentMethod || 'Direct / Mobile Money'}</p>
                    <span className={`mt-2 inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${paymentBadge(selectedOrder.paymentStatus || 'unpaid')}`}>
                      {selectedOrder.paymentStatus || 'unpaid'}
                    </span>
                  </div>
                  <div className="bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/60">
                    <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#C5A059]" /> Timestamp
                    </h3>
                    <p className="font-semibold text-zinc-900 dark:text-white text-xs tabular-nums">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 tabular-nums">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="pt-2 space-y-3">
                  <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Update Order Status
                  </h3>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 text-zinc-900 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                    <button
                      onClick={() => setOrderToCancel(selectedOrder._id)}
                      className="w-full py-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-rose-100 dark:hover:bg-rose-500/20 active:scale-[0.98] transition-all border border-rose-200 dark:border-rose-500/20"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {orderToCancel && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOrderToCancel(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#121212] rounded-2xl p-7 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4 mx-auto text-rose-600">
                <AlertTriangle size={22} />
              </div>
              <div className="text-center mb-6">
                <h3 className="font-serif text-xl font-bold text-zinc-900 dark:text-white mb-2">Cancel Transaction?</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                  Are you sure you want to cancel order <span className="font-mono font-bold text-rose-500">#{orderToCancel.substring(0, 8)}</span>? This status update will be logged permanently.
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => handleCancelOrder(orderToCancel)}
                  disabled={!!updatingId}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  {updatingId === orderToCancel ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Cancelling...
                    </>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </button>
                <button
                  onClick={() => setOrderToCancel(null)}
                  className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] text-zinc-900 dark:text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all"
                >
                  Return
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
