import React from 'react';
import { GigStatus } from '../../types';

interface StatusBadgeProps {
  status: GigStatus | 'pending' | 'accepted' | 'declined';
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const normStatus = status.toUpperCase();

  let styles = 'bg-gray-100 text-gray-800 border-gray-200';

  switch (normStatus) {
    case 'REQUESTED':
    case 'PENDING':
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'ACCEPTED':
      styles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      break;
    case 'IN_PROGRESS':
      styles = 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse';
      break;
    case 'COMPLETED':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case 'DECLINED':
      styles = 'bg-rose-50 text-rose-800 border-rose-200';
      break;
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-all ${styles} ${className}`}>
      {normStatus.replace('_', ' ')}
    </span>
  );
}
