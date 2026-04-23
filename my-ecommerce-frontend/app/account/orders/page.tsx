'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, ChevronRight, RefreshCw, Clock, CheckCircle2, Truck, PackageCheck, X } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useNotification } from '@/src/context/NotificationContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/src/lib/api';

const API = API_URL;

interface OrderItem {
  product: { _id: string; name: string; price: number; images: string[] } | null;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: { address: string; city: string; country: string; postalCode: string };
  createdAt: string;
}

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-500/10', icon: Clock },
  processing: { label: 'Processing', color: 'text-indigo-600', bg: 'bg-indigo-500/10', icon: RefreshCw },
  shipped: { label: 'Shipped', color: 'text-blue-600', bg: 'bg-blue-500/10', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-500/10', icon: PackageCheck },
  cancelled: { label: 'Cancelled', color: 'text-rose-600', bg: 'bg-rose-500/10', icon: X },
};

export default function OrdersPage() {
  const { token, isLoggedIn, isLoading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'shipped' | 'delivered' | 'cancelled'>('ongoing');

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
      return;
    }
    if (token) fetchOrders();
  }, [token, authLoading]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders(await res.json());
      } else {
        setError('Failed to load orders');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: string) => STATUS_STEPS.indexOf(status);

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`${API}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showNotification('Order successfully cancelled', 'success');
        setConfirmingCancel(null);
        fetchOrders();
      } else {
        const err = await res.json();
        showNotification(err.message || 'Failed to cancel order', 'error');
      }
    } catch (err) {
      showNotification('Network error. Unable to cancel order.', 'error');
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center pb-20"><div className="w-8 h-8 border-2 border-brand-text/10 border-t-brand-accent rounded-full animate-spin" /></div>;

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ongoing') return ['pending', 'processing'].includes(o.status);
    if (activeTab === 'shipped') return o.status === 'shipped';
    if (activeTab === 'delivered') return o.status === 'delivered';
    if (activeTab === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <header className="sticky top-0 z-50 bg-brand-bg  border-b border-brand-text/5">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/account" className="text-brand-muted hover:text-brand-text transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-serif font-bold tracking-tight">My Orders</h1>
          </div>
          <button onClick={fetchOrders} className="p-2 text-brand-muted hover:text-brand-accent transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-4 md:px-8 flex gap-6 overflow-x-auto no-scrollbar">
          {(['ongoing', 'shipped', 'delivered', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-sans font-medium uppercase tracking-widest whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-brand-accent' : 'text-brand-muted hover:text-brand-text'}`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-accent" />}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
        {/* Error state */}
        {error && (
          <div className="text-center py-10">
            <p className="text-red-500 font-sans text-sm mb-4">{error}</p>
            <button onClick={fetchOrders} className="text-brand-accent text-sm font-sans font-semibold uppercase tracking-widest">
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-brand-panel rounded-2xl p-6 border border-brand-text/5 animate-pulse">
                <div className="h-4 bg-brand-text/5 rounded w-1/3 mb-3" />
                <div className="h-3 bg-brand-text/5 rounded w-1/2 mb-2" />
                <div className="h-3 bg-brand-text/5 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="text-center py-20">
            <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-brand-panel border border-brand-text/5 flex items-center justify-center">
              <Package className="w-12 h-12 text-brand-muted" strokeWidth={1} />
            </div>
            <h2 className="text-2xl font-serif tracking-tight mb-3">No orders found</h2>
            <p className="text-brand-muted font-sans font-light text-sm mb-8 max-w-sm mx-auto">
              There are no orders in the {activeTab} section.
            </p>
            <Link href="/categories" className="btn-gold inline-flex items-center gap-2 px-10 py-3.5 text-sm shadow-soft">
              Continue Shopping
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = config.icon;
              const isExpanded = expandedOrder === order._id;
              const currentStep = getStepIndex(order.status);
              const isCancelable = order.status === 'pending' || order.status === 'processing';

              return (
                <div
                  key={order._id}
                  className="bg-brand-panel rounded-2xl border border-brand-text/5 overflow-hidden"
                >
                  {/* Order Header - clickable */}
                  <div
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-brand-text/[0.02] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* First product image */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-brand-bg flex-shrink-0">
                        {order.items[0]?.product?.images?.[0] ? (
                          <img src={order.items[0].product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-brand-muted" /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans font-semibold text-sm text-brand-text truncate">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                        <p className="text-brand-muted text-xs font-sans mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-brand-accent font-sans font-semibold text-sm mt-1">₵{order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Status and Action Badge Row */}
                      <div className="flex items-center gap-2">
                        {isCancelable && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmingCancel(order._id);
                            }}
                            className="text-[10px] bg-red-500/10 text-red-500 px-2 py-1 rounded-full font-sans font-semibold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-sans font-semibold uppercase tracking-widest cursor-pointer ${config.color} ${config.bg}`} onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-brand-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                      
                      {/* Inline Cancel Confirmation */}
                      {confirmingCancel === order._id && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-red-500 font-medium">Sure?</span>
                          <button onClick={(e) => { e.stopPropagation(); handleCancelOrder(order._id); }} className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded shadow hover:bg-red-600">Yes</button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmingCancel(null); }} className="text-[10px] bg-brand-text/10 px-2 py-0.5 rounded hover:bg-brand-text/20">No</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-brand-text/5 px-5 py-5">
                      {/* Order ref */}
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-[10px] font-sans uppercase tracking-widest text-brand-muted">Order Ref</span>
                        <span className="font-mono text-xs text-brand-text">{order._id.slice(-8).toUpperCase()}</span>
                      </div>

                      {/* Progress Timeline */}
                      {order.status !== 'cancelled' && (
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            {STATUS_STEPS.map((step, i) => {
                              const stepConfig = STATUS_CONFIG[step];
                              const StepIcon = stepConfig.icon;
                              const isComplete = i <= currentStep;
                              return (
                                <div key={step} className="flex flex-col items-center flex-1">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isComplete ? 'bg-brand-accent text-white' : 'bg-brand-text/5 text-brand-muted'}`}>
                                    <StepIcon className="w-4 h-4" />
                                  </div>
                                  <span className={`text-[9px] font-sans font-medium mt-1.5 uppercase tracking-widest ${isComplete ? 'text-brand-accent' : 'text-brand-muted'}`}>
                                    {stepConfig.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {/* Progress bar */}
                          <div className="h-1 bg-brand-text/5 rounded-full mx-4 mt-1">
                            <div
                              className="h-full bg-brand-accent rounded-full transition-all duration-500"
                              style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-3 mb-4">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-12 rounded-lg overflow-hidden bg-brand-bg flex-shrink-0">
                              {item.product?.images?.[0] ? (
                                <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : null}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-sans text-sm truncate">{item.product?.name || 'Product unavailable'}</p>
                              <p className="text-brand-muted text-xs font-sans">Qty: {item.quantity} × ₵{item.price.toFixed(2)}</p>
                            </div>
                            <p className="font-sans font-medium text-sm">₵{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Shipping */}
                      <div className="bg-brand-bg rounded-xl p-3 text-xs font-sans text-brand-muted mb-4">
                        <span className="font-semibold text-brand-text">Ship to:</span>{' '}
                        {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
