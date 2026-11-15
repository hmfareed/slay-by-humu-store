'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { API_URL } from '@/src/lib/api';
import { getGuestOrders } from '@/src/lib/guestOrders';
import OrderTrackingView, { TrackedOrder } from '@/components/OrderTrackingView';

export default function TrackOrderByTokenPage() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/track/${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok) setOrder(data);
        else setError(data.message || 'Order not found');
      } catch {
        setError('Network error. Please try again.');
      }
    };
    load();
  }, [token]);

  // Offer "save to account" only if this device holds the order (it created it)
  const canClaim = order ? getGuestOrders().some((o) => o.orderId === order._id) : false;

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-20 md:py-28">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-block text-2xl font-bold tracking-tighter mb-10">
          Slay by Humu<span className="text-brand-accent">.</span>
        </Link>

        {!order && !error && (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 text-brand-accent animate-spin" aria-label="Loading order" />
          </div>
        )}

        {error && (
          <div className="bg-brand-panel border border-brand-text/5 rounded-3xl p-10 text-center font-sans shadow-soft">
            <p className="text-lg font-medium mb-2">{error}</p>
            <p className="text-sm text-brand-muted mb-6">The link may be incomplete. You can also look up your order by number and email.</p>
            <Link href="/track-order" className="btn-gold px-8 py-3 text-sm">Look up an order</Link>
          </div>
        )}

        {order && (
          <OrderTrackingView
            order={order}
            claimHref={canClaim ? `/login?claim=${order._id}&redirect=/account/orders` : undefined}
          />
        )}
      </div>
    </div>
  );
}
