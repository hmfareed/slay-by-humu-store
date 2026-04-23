'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package, MapPin, CreditCard, User, Calendar, ChevronDown, AlertTriangle } from 'lucide-react';

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

const STATUS_TABS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const res = await fetch(`${API_URL}/orders/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const filteredOrders = orders.filter(o =>
    o._id.toLowerCase().includes(search.toLowerCase()) ||
    (o.user && o.user.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    if (s === 'shipped') return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    if (s === 'processing') return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
    if (s === 'cancelled') return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
    return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
  };

  const paymentBadge = (ps: string) => {
    if (ps === 'paid') return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    if (ps === 'refunded') return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
    return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Orders</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Full order management and tracking.</p>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-zinc-600 dark:text-zinc-400">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize whitespace-nowrap ${
              statusFilter === tab
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#121212] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700'
            }`}
          >
            {tab}
            {tab !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({orders.filter(o => tab === 'all' || o.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 ring-violet-500/50 transition-all text-zinc-800 dark:text-zinc-200"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 ring-violet-500/50 text-zinc-700 dark:text-zinc-300"
            placeholder="From"
          />
          <span className="text-zinc-400">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 ring-violet-500/50 text-zinc-700 dark:text-zinc-300"
            placeholder="To"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></span>
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                      #{order._id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 dark:text-white">{order.user?.name || 'Guest'}</p>
                      <p className="text-xs text-zinc-500">{order.user?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                      ₵{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${paymentBadge(order.paymentStatus || 'unpaid')}`}>
                        {order.paymentStatus || 'unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {updatingId === order._id ? (
                        <span className="text-xs text-violet-500 font-medium flex items-center gap-1">
                          <span className="w-3 h-3 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></span>
                          Updating...
                        </span>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-3 py-1.5 focus:outline-none cursor-pointer border capitalize ${statusBadge(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-zinc-600 dark:text-zinc-400">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <button
                            onClick={() => setOrderToCancel(order._id)}
                            className="px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
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
              className="fixed inset-0 bg-black/80  z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-[#0A0A0A] z-[101] shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-[#0A0A0A]  z-10 p-6 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Order Details</h2>
                  <p className="text-sm text-zinc-500">#{selectedOrder._id.substring(0, 8)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                  <X size={20} className="text-zinc-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2"><User size={14} /> Customer</h3>
                  <p className="font-medium text-zinc-900 dark:text-white">{selectedOrder.user?.name || 'Guest'}</p>
                  <p className="text-sm text-zinc-500">{selectedOrder.user?.email}</p>
                  {selectedOrder.user?.phone && <p className="text-sm text-zinc-500">{selectedOrder.user.phone}</p>}
                </div>

                {/* Products Ordered */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Package size={14} /> Products</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-3">
                        <div className="w-14 h-14 rounded-xl bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                          {item.product?.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400"><Package size={20} /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-900 dark:text-white text-sm truncate">{item.product?.name || 'Product'}</p>
                          <p className="text-xs text-zinc-500">Qty: {item.quantity} × ₵{item.price}</p>
                        </div>
                        <p className="font-medium text-zinc-900 dark:text-white text-sm">₵{item.quantity * item.price}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-500">Total Amount</span>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white">₵{selectedOrder.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2"><MapPin size={14} /> Delivery Address</h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{selectedOrder.shippingAddress?.address}</p>
                  <p className="text-sm text-zinc-500">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}</p>
                  <p className="text-sm text-zinc-500">{selectedOrder.shippingAddress?.postalCode}</p>
                  {selectedOrder.shippingAddress?.phoneNumber && (
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-300 mt-2 flex items-center gap-2">📞 {selectedOrder.shippingAddress.phoneNumber}</p>
                  )}
                </div>

                {/* Payment & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2"><CreditCard size={14} /> Payment</h3>
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">{selectedOrder.paymentMethod || 'N/A'}</p>
                    <span className={`mt-2 inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${paymentBadge(selectedOrder.paymentStatus || 'unpaid')}`}>
                      {selectedOrder.paymentStatus || 'unpaid'}
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Calendar size={14} /> Date</h3>
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-zinc-500 mt-1">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="pt-2 space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Update Status</h3>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium capitalize focus:outline-none focus:ring-2 ring-violet-500/50 text-zinc-900 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                    <button
                      onClick={() => setOrderToCancel(selectedOrder._id)}
                      className="w-full py-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-medium hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors border border-rose-200 dark:border-rose-500/20"
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-2xl border border-zinc-100 dark:border-zinc-800/50 overflow-hidden"
            >
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Cancel Order?</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  Are you sure you want to cancel order <span className="font-mono font-bold text-rose-500">#{orderToCancel.substring(0, 8)}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleCancelOrder(orderToCancel)}
                  disabled={!!updatingId}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {updatingId === orderToCancel ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel Order'
                  )}
                </button>
                <button
                  onClick={() => setOrderToCancel(null)}
                  className="w-full py-3.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-2xl font-bold text-sm transition-all"
                >
                  No, Keep Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
