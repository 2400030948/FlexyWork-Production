'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { User } from '../types';
import { getMe } from '../services/auth';
import { getMyGigs } from '../services/gigs';
import {
  createRazorpayOrder,
  getRazorpayConfig,
  getShiftPayments,
  openRazorpayCheckout,
  verifyRazorpayPayment
} from '../services/payments';

type PaymentStatus = 'unpaid' | 'paid' | 'failed';

export interface DuePayment {
  shiftId: string;
  title: string;
  amount: number;
  checkInTime: string;
}

interface UseEmployerRazorpayPaymentOptions {
  shiftId?: string;
  enabled?: boolean;
  pollIntervalMs?: number;
}

function checkInKey(shiftId: string, checkInTime: string) {
  return `${shiftId}:${checkInTime}`;
}

function loadPromptedKeys(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem('flexywork_prompted_checkins');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function savePromptedKeys(keys: Set<string>) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('flexywork_prompted_checkins', JSON.stringify([...keys]));
}

export function useEmployerRazorpayPayment({
  shiftId,
  enabled = true,
  pollIntervalMs = 15000
}: UseEmployerRazorpayPaymentOptions = {}) {
  const [razorpayConfigured, setRazorpayConfigured] = useState(false);
  const [payingShiftId, setPayingShiftId] = useState<string | null>(null);
  const [paymentStatusByShift, setPaymentStatusByShift] = useState<Record<string, PaymentStatus>>({});
  const [duePayment, setDuePayment] = useState<DuePayment | null>(null);
  const openingRef = useRef<string | null>(null);
  const paidShiftIdsRef = useRef<Set<string>>(new Set());
  const promptedCheckInsRef = useRef<Set<string>>(loadPromptedKeys());
  const knownCheckInsRef = useRef<Record<string, string>>({});
  const isInitializedRef = useRef(false);
  const duePaymentRef = useRef<DuePayment | null>(null);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    duePaymentRef.current = duePayment;
  }, [duePayment]);

  const markCheckInPrompted = useCallback((shiftIdValue: string, checkInTime: string) => {
    const key = checkInKey(shiftIdValue, checkInTime);
    promptedCheckInsRef.current.add(key);
    savePromptedKeys(promptedCheckInsRef.current);
  }, []);

  useEffect(() => {
    let mounted = true;
    getRazorpayConfig()
      .then((cfg) => {
        if (!mounted) return;
        setRazorpayConfigured(Boolean(cfg.configured && cfg.keyId));
      })
      .catch(() => {
        if (!mounted) return;
        setRazorpayConfigured(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const resolvePaymentStatus = useCallback(async (id: string): Promise<PaymentStatus> => {
    if (paidShiftIdsRef.current.has(id)) return 'paid';
    try {
      const payments = await getShiftPayments(id);
      if (payments.some((p) => p.status === 'completed')) {
        paidShiftIdsRef.current.add(id);
        return 'paid';
      }
      if (payments.some((p) => p.status === 'failed')) return 'failed';
      return 'unpaid';
    } catch {
      return 'unpaid';
    }
  }, []);

  const dismissDuePayment = useCallback(() => {
    setDuePayment((current) => {
      if (current) {
        markCheckInPrompted(current.shiftId, current.checkInTime);
      }
      return null;
    });
  }, [markCheckInPrompted]);

  const startPayment = useCallback(async (id: string, title: string, _amount: number, checkInTime?: string) => {
    if (!razorpayConfigured || openingRef.current === id || paidShiftIdsRef.current.has(id)) {
      return false;
    }

    let user = userRef.current;
    if (!user) {
      user = await getMe();
      userRef.current = user;
    }
    if (!user || user.role === 'worker') return false;

    openingRef.current = id;
    setPayingShiftId(id);

    try {
      const status = await resolvePaymentStatus(id);
      if (status === 'paid') {
        setPaymentStatusByShift((prev) => ({ ...prev, [id]: 'paid' }));
        setDuePayment(null);
        return true;
      }

      const order = await createRazorpayOrder(id);

      await openRazorpayCheckout({
        orderId: order.orderId,
        amountPaise: order.amount,
        currency: order.currency,
        keyId: order.keyId,
        employerName: user.name || 'Employer',
        employerEmail: user.email || '',
        employerPhone: user.phone,
        description: `Payout for ${title}`,
        shiftId: id,
        onSuccess: async (response) => {
          await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            shiftId: id
          });
          paidShiftIdsRef.current.add(id);
          setPaymentStatusByShift((prev) => ({ ...prev, [id]: 'paid' }));
          setDuePayment(null);
        },
        onDismiss: () => {
          setPaymentStatusByShift((prev) => ({ ...prev, [id]: 'unpaid' }));
          if (checkInTime) {
            markCheckInPrompted(id, checkInTime);
          }
        }
      });

      return true;
    } catch (error: any) {
      setPaymentStatusByShift((prev) => ({ ...prev, [id]: 'failed' }));
      console.error('Razorpay checkout failed:', error?.message || error);
      return false;
    } finally {
      openingRef.current = null;
      setPayingShiftId(null);
    }
  }, [razorpayConfigured, resolvePaymentStatus, markCheckInPrompted]);

  const scanForDuePayments = useCallback(async () => {
    if (!enabled || duePaymentRef.current) return;

    const user = await getMe();
    userRef.current = user;
    if (!user || user.role === 'worker') return;

    const gigs = shiftId
      ? (await getMyGigs()).filter((g) => g.id === shiftId)
      : await getMyGigs();

    const statuses: Record<string, PaymentStatus> = {};

    // On first scan, record existing check-ins without prompting (already happened before this session).
    if (!isInitializedRef.current) {
      for (const gig of gigs) {
        if (gig.checkInTime) {
          knownCheckInsRef.current[gig.id] = gig.checkInTime;
        }
        if (gig.checkInTime) {
          statuses[gig.id] = await resolvePaymentStatus(gig.id);
        }
      }
      isInitializedRef.current = true;
      setPaymentStatusByShift((prev) => ({ ...prev, ...statuses }));
      return;
    }

    for (const gig of gigs) {
      if (!gig.checkInTime) {
        delete knownCheckInsRef.current[gig.id];
        continue;
      }

      const status = await resolvePaymentStatus(gig.id);
      statuses[gig.id] = status;

      if (status === 'paid') {
        knownCheckInsRef.current[gig.id] = gig.checkInTime;
        continue;
      }

      const hadCheckIn = knownCheckInsRef.current[gig.id];
      const isFreshCheckIn = !hadCheckIn;
      knownCheckInsRef.current[gig.id] = gig.checkInTime;

      const promptKey = checkInKey(gig.id, gig.checkInTime);
      const alreadyPrompted = promptedCheckInsRef.current.has(promptKey);

      // Only prompt when worker checks in during this session (checkInTime appears for the first time).
      if (isFreshCheckIn && !alreadyPrompted) {
        markCheckInPrompted(gig.id, gig.checkInTime);
        setDuePayment({
          shiftId: gig.id,
          title: gig.title,
          amount: gig.paymentAmount,
          checkInTime: gig.checkInTime
        });
        break;
      }
    }

    setPaymentStatusByShift((prev) => ({ ...prev, ...statuses }));
  }, [enabled, shiftId, resolvePaymentStatus, markCheckInPrompted]);

  useEffect(() => {
    if (!enabled) return;

    scanForDuePayments();
    const interval = setInterval(scanForDuePayments, pollIntervalMs);

    return () => clearInterval(interval);
  }, [enabled, scanForDuePayments, pollIntervalMs]);

  return {
    razorpayConfigured,
    payingShiftId,
    paymentStatusByShift,
    duePayment,
    dismissDuePayment,
    startPayment
  };
}
