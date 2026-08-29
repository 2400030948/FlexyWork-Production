'use client';

import React, { createContext, useContext } from 'react';
import { useEmployerRazorpayPayment } from '../../hooks/useEmployerRazorpayPayment';
import EmployerPaymentModal from './EmployerPaymentModal';

type PaymentContextValue = ReturnType<typeof useEmployerRazorpayPayment>;

const PaymentContext = createContext<PaymentContextValue | null>(null);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const payment = useEmployerRazorpayPayment({ enabled: true, pollIntervalMs: 15000 });
  return (
    <PaymentContext.Provider value={payment}>
      <EmployerPaymentModal />
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider');
  }
  return context;
}
