'use client';

import Link from 'next/link';
import { getOptimizedImageUrl } from '@/src/lib/images';

export type TrackedOrder = {
  _id: string;
  orderNumber?: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  processingFee?: number;
  chargedAmount?: number;
  isClaimed?: boolean;
  createdAt: string;
  shippingAddress?: { address: string; city: string; country: string; postalCode: string };
  items: { quantity: number; price: number; product: { _id: string; name: string; images?: string[] } | null }[];
};

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const formatGHS = (n: number) => `₵${Number(n || 0).toFixed(2)}`;

export default function OrderTrackingView({ order, claimHref }: { order: TrackedOrder; claimHref?: string }) {
  const cancelled = order.status === 'cancelled';
  const currentStep = Math.max(0, STEPS.indexOf(order.status === 'picked_up' ? 'delivered' : order.status));

  return (
    <div className="bg-brand-panel border border-brand-text/5 rounded-3xl p-8 md:p-12 shadow-soft font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-xs tracking-widest uppercase text-brand-muted mb-2">Order</p>
          <h1 className="text-3xl font-serif font-bold tracking-tight font-mono">{order.orderNumber || order._id}</h1>
          <p className="text-sm text-brand-muted mt-1">
            Placed {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </p>
        </div>
        <span
          className={`self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider ${
            order.paymentStatus === 'paid'
              ? 'bg-emerald-500/10 text-emerald-600'
              : order.paymentStatus === 'refunded'
              ? 'bg-sky-500/10 text-sky-600'
              : 'bg-amber-500/10 text-amber-600'
          }`}
        >
          {order.paymentStatus}
        </span>
      </div>

      {cancelled ? (
        <p className="mb-10 p-4 rounded-2xl bg-rose-500/10 text-rose-600 text-sm">This order was cancelled.</p>
      ) : (
        <ol className="grid grid-cols-4 gap-2 mb-12" aria-label="Order progress">
          {STEPS.map((step, i) => (
            <li key={step} className="flex flex-col gap-2">
              <span className={`h-1.5 rounded-full ${i <= currentStep ? 'bg-brand-accent' : 'bg-brand-text/10'}`} />
              <span className={`text-xs capitalize ${i <= currentStep ? 'text-brand-text font-medium' : 'text-brand-muted'}`}>
                {step}
              </span>
            </li>
          ))}
        </ol>
      )}

      <ul className="divide-y divide-brand-text/5 mb-8">
        {order.items.map((item, idx) => (
          <li key={item.product?._id || idx} className="flex items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-xl bg-brand-text/5 overflow-hidden shrink-0">
              {item.product?.images?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getOptimizedImageUrl(item.product.images[0], 128)} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.product?.name || 'Item no longer available'}</p>
              <p className="text-sm text-brand-muted tabular-nums">Qty {item.quantity}</p>
            </div>
            <p className="tabular-nums font-medium">{formatGHS(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <dl className="space-y-2 text-sm mb-8">
        <div className="flex justify-between"><dt className="text-brand-muted">Subtotal</dt><dd className="tabular-nums">{formatGHS(order.totalAmount)}</dd></div>
        {!!order.processingFee && (
          <div className="flex justify-between"><dt className="text-brand-muted">Processing fee</dt><dd className="tabular-nums">{formatGHS(order.processingFee)}</dd></div>
        )}
        <div className="flex justify-between font-semibold text-base pt-2 border-t border-brand-text/5">
          <dt>Total</dt><dd className="tabular-nums">{formatGHS(order.chargedAmount || order.totalAmount)}</dd>
        </div>
      </dl>

      {order.shippingAddress && (
        <div className="text-sm mb-8">
          <p className="text-xs tracking-widest uppercase text-brand-muted mb-2">Delivering to</p>
          <p>{order.shippingAddress.address}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.country}</p>
        </div>
      )}

      {claimHref && !order.isClaimed && (
        <div className="pt-6 border-t border-brand-text/10 text-sm">
          <Link href={claimHref} className="text-brand-accent font-medium hover:underline">
            Save this order to an account →
          </Link>
        </div>
      )}
    </div>
  );
}
