'use client';

import React from 'react';
import { CreditCard, Loader2, X } from 'lucide-react';
import { usePayment } from './PaymentProvider';

export default function EmployerPaymentModal() {
  const { duePayment, dismissDuePayment, startPayment, payingShiftId, razorpayConfigured } = usePayment();

  if (!duePayment) return null;

  const paying = payingShiftId === duePayment.shiftId;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-surface-border shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#1f6fa6]">Payment Required</p>
            <h2 className="text-lg font-extrabold text-ink mt-1">Worker checked in with OTP</h2>
          </div>
          <button
            type="button"
            onClick={dismissDuePayment}
            className="p-1.5 rounded-lg text-ink-muted hover:bg-stone-100"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-ink-muted leading-relaxed">
          <strong className="text-ink">{duePayment.title}</strong> — the worker verified arrival.
          Complete payment to secure their payout of{' '}
          <strong className="text-ink">₹{duePayment.amount}</strong> via Razorpay.
        </p>

        {!razorpayConfigured && (
          <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Razorpay is not configured on the server. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.
          </p>
        )}

        <button
          type="button"
          onClick={() => startPayment(duePayment.shiftId, duePayment.title, duePayment.amount, duePayment.checkInTime)}
          disabled={!razorpayConfigured || paying}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f6fa6] hover:bg-[#155a8a] text-white px-5 py-3 text-sm font-extrabold shadow-md transition-all disabled:opacity-50"
        >
          {paying ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Opening Razorpay...
            </>
          ) : (
            <>
              <CreditCard size={16} />
              Pay ₹{duePayment.amount} with Razorpay
            </>
          )}
        </button>

        <p className="text-[10px] text-ink-subtle text-center">
          Click the button above to open the secure Razorpay checkout.
        </p>
      </div>
    </div>
  );
}
