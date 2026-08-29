'use client';

import React from 'react';
import { PaymentProvider } from '../payments/PaymentProvider';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <PaymentProvider>{children}</PaymentProvider>;
}
