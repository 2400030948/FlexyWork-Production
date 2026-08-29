import { Transaction } from '../types';
import { apiCall } from './api';

export interface RazorpayConfig {
  configured: boolean;
  keyId: string | null;
  currency: string;
  companyName: string;
}

export interface RazorpayOrder {
  orderId: string;
  amount: number; // paise
  currency: string;
  keyId: string;
  receipt: string;
  totalAmount: number; // rupees
  workersCount: number;
  amountPerWorker: number;
  paymentIds: string[];
}

export interface RazorpayVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  shiftId: string;
}

export interface RazorpayVerifyResponse {
  verified: boolean;
  payments: Transaction[];
}

export async function getPayments(): Promise<Transaction[]> {
  const data = await apiCall<{ payments: Transaction[] }>('/api/payments');
  return data.payments;
}

export async function getShiftPayments(shiftId: string): Promise<Transaction[]> {
  const data = await apiCall<{ payments: Transaction[] }>(`/api/payments/by-shift/${shiftId}`);
  return data.payments;
}

export async function markShiftPaid(shiftId: string): Promise<Transaction[]> {
  const data = await apiCall<{ payments: Transaction[] }>(`/api/payments/${shiftId}/mark-paid`, {
    method: 'POST'
  });
  return data.payments;
}

export async function getRazorpayConfig(): Promise<RazorpayConfig> {
  return apiCall<RazorpayConfig>('/api/payments/config');
}

export async function createRazorpayOrder(shiftId: string): Promise<RazorpayOrder> {
  return apiCall<RazorpayOrder>(`/api/payments/${shiftId}/create-order`, {
    method: 'POST'
  });
}

export async function verifyRazorpayPayment(payload: RazorpayVerifyPayload): Promise<RazorpayVerifyResponse> {
  return apiCall<RazorpayVerifyResponse>('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Lazily load the Razorpay Checkout script. Resolves to the global
 * `window.Razorpay` constructor or rejects if the script cannot be loaded.
 */
let razorpayScriptPromise: Promise<any> | null = null;

export function loadRazorpayScript(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only be loaded in the browser'));
  }
  const w = window as any;
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve(w.Razorpay));
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve(w.Razorpay);
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.head.appendChild(script);
  });

  return razorpayScriptPromise;
}

export interface RazorpayCheckoutOptions {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  employerName: string;
  employerEmail: string;
  employerPhone?: string;
  description: string;
  shiftId: string;
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
}

/**
 * Open the Razorpay Checkout widget using a previously-created order.
 * The key id passed in is the public key from the server's /api/payments/config.
 */
export async function openRazorpayCheckout(opts: RazorpayCheckoutOptions): Promise<void> {
  const Razorpay = await loadRazorpayScript();
  return new Promise<void>((resolve, reject) => {
    try {
      const rzp = new Razorpay({
        key: opts.keyId,
        amount: opts.amountPaise,
        currency: opts.currency,
        name: 'FlexyWork',
        description: opts.description,
        order_id: opts.orderId,
        prefill: {
          name: opts.employerName,
          email: opts.employerEmail,
          ...(opts.employerPhone ? { contact: opts.employerPhone } : {})
        },
        theme: { color: '#3399cc' },
        modal: {
          ondismiss: () => {
            opts.onDismiss?.();
            resolve();
          }
        },
        handler: (response: any) => {
          try {
            opts.onSuccess({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            resolve();
          } catch (err) {
            reject(err);
          }
        }
      });
      rzp.on('payment.failed', (response: any) => {
        const reason = response?.error?.description || 'Razorpay payment failed';
        reject(new Error(reason));
      });
      rzp.open();
    } catch (err) {
      reject(err);
    }
  });
}
