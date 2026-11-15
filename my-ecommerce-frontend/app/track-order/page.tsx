'use client';

import { useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/src/lib/api';
import OrderTrackingView, { TrackedOrder } from '@/components/OrderTrackingView';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) setOrder(data);
      else setError(data.message || 'No order matches those details');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-4 bg-transparent border border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-base font-light rounded-none';

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-20 md:py-28">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-block text-2xl font-bold tracking-tighter mb-10">
          Slay by Humu<span className="text-brand-accent">.</span>
        </Link>

        {order ? (
          <>
            <OrderTrackingView order={order} />
            <button
              type="button"
              onClick={() => setOrder(null)}
              className="mt-6 text-sm font-sans text-brand-muted hover:text-brand-text transition-colors"
            >
              ← Look up another order
            </button>
          </>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-brand-panel border border-brand-text/5 rounded-3xl p-8 md:p-12 shadow-soft font-sans space-y-8"
          >
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">Track your order</h1>
              <p className="text-sm text-brand-muted">
                Checked out as a guest? Enter the order number from your confirmation and the email you used.
                Have an account? <Link href="/login?redirect=/account/orders" className="text-brand-accent hover:underline">Log in</Link> instead.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="order-number" className="text-xs font-medium tracking-widest uppercase text-brand-muted">Order number</label>
              <input
                id="order-number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className={`${inputClass} font-mono uppercase`}
                placeholder="SBH-XXXXXXXX"
                autoComplete="off"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="order-email" className="text-xs font-medium tracking-widest uppercase text-brand-muted">Email</label>
              <input
                id="order-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
                required
              />
            </div>

            {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}

            <button type="submit" disabled={loading} className="btn-gold w-full shadow-soft disabled:opacity-60">
              {loading ? 'Looking up…' : 'Find my order'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
