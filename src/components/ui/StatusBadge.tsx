import React from 'react';
import { GigStatus } from '../../types';

interface StatusBadgeProps {
  status: GigStatus | 'pending' | 'accepted' | 'declined' | 'published' | 'filled' | 'in_progress' | 'completed' | 'cancelled';
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const normStatus = (status || '').toUpperCase();

  let styles = 'bg-stone-100 text-ink-muted border-surface-border';
  let label = normStatus.replace('_', ' ');

  switch (normStatus) {
    case 'PUBLISHED':
    case 'REQUESTED':
    case 'PENDING':
    case 'OPEN':
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      label = 'Open (Seeking Workers)';
      break;
    case 'FILLED':
    case 'ACCEPTED':
    case 'CONFIRMED':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      label = 'Staffed & Confirmed';
      break;
    case 'IN_PROGRESS':
    case 'WORKING':
      styles = 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse';
      label = 'On-Site / In-Progress';
      break;
    case 'COMPLETED':
      styles = 'bg-emerald-100 text-emerald-900 border-emerald-300';
      label = 'Work Completed';
      break;
    case 'DECLINED':
    case 'CANCELLED':
    case 'REJECTED':
      styles = 'bg-rose-50 text-rose-800 border-rose-200';
      label = 'Cancelled';
      break;
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold tracking-wide transition-all ${styles} ${className}`}>
      {label}
    </span>
  );
}
