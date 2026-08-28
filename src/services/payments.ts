import { Transaction } from '../types';
import { apiCall } from './api';

export async function getPayments(): Promise<Transaction[]> {
  const data = await apiCall<{ payments: Transaction[] }>('/api/payments');
  return data.payments;
}

export async function markShiftPaid(shiftId: string): Promise<Transaction[]> {
  const data = await apiCall<{ payments: Transaction[] }>(`/api/payments/${shiftId}/mark-paid`, {
    method: 'POST'
  });
  return data.payments;
}
