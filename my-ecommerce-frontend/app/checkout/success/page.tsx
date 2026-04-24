'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { API_URL } from '@/src/lib/api';
import { motion } from 'framer-motion';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found.');
      return;
    }

    const verify = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/payments/verify/${reference}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setOrderId(data.order?._id || '');
          setMessage('Your payment was received successfully. Your order is now being processed.');
        } else {
          setStatus('failed');
          setMessage(data.message || 'Payment verification failed.');
        }
      } catch (err) {
        setStatus('failed');
        setMessage('Network error while verifying payment.');
      }
    };

    verify();
  }, [reference]);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-brand-panel border border-brand-text/5 rounded-3xl p-12 max-w-lg w-full text-center shadow-soft"
      >
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 text-brand-accent mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-serif font-bold mb-2">Verifying Payment...</h1>
            <p className="text-brand-muted font-sans text-sm">Please wait while we confirm your transaction.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-3xl font-serif font-bold mb-3 tracking-tight">Payment Successful!</h1>
            <p className="text-brand-muted font-sans text-sm mb-2">{message}</p>
            {reference && (
              <p className="text-xs font-mono text-brand-muted mb-8">Ref: {reference}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {orderId && (
                <Link
                  href="/account/orders"
                  className="btn-gold px-8 py-3 text-sm shadow-soft"
                >
                  Track Order
                </Link>
              )}
              <Link
                href="/products"
                className="px-8 py-3 bg-brand-text/5 hover:bg-brand-text/10 rounded-full text-sm font-sans font-medium transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-20 h-20 text-rose-500 mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-bold mb-3 tracking-tight">Payment Failed</h1>
            <p className="text-brand-muted font-sans text-sm mb-8">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/checkout" className="btn-gold px-8 py-3 text-sm shadow-soft">
                Try Again
              </Link>
              <Link
                href="/"
                className="px-8 py-3 bg-brand-text/5 hover:bg-brand-text/10 rounded-full text-sm font-sans font-medium transition-colors"
              >
                Go Home
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
