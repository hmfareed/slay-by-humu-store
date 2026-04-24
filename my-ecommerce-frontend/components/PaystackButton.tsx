'use client';

import { useState } from 'react';
import { API_URL } from '@/src/lib/api';
import { CreditCard, Loader2 } from 'lucide-react';

interface PaystackButtonProps {
  orderId: string;
  amount: number; // in GHS
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

/**
 * PaystackButton
 * 
 * Calls /api/payments/initialize with the given orderId.
 * On success, redirects the user to Paystack's hosted payment page.
 * After payment, Paystack redirects to /checkout/success?reference=xxx
 * where we call /api/payments/verify/:reference to confirm.
 */
export default function PaystackButton({ orderId, amount, onSuccess, onError }: PaystackButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        onError?.(data.message || 'Failed to initialize payment');
        return;
      }

      // Redirect to Paystack's hosted payment page
      window.location.href = data.authorization_url;
    } catch (err) {
      onError?.('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-[#0BA4DB] hover:bg-[#0993c7] text-white font-sans font-bold text-sm uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-[#0BA4DB]/20 transition-all disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Connecting to Paystack...
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          Pay ₵{amount.toFixed(2)} with Paystack
        </>
      )}
    </button>
  );
}
