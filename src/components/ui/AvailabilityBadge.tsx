import React from 'react';
import { Calendar } from 'lucide-react';

interface AvailabilityBadgeProps {
  status: 'Available' | 'Unavailable' | 'Limited';
  text?: string;
  className?: string;
}

export default function AvailabilityBadge({ status, text, className = '' }: AvailabilityBadgeProps) {
  let styles = 'bg-stone-50 text-stone-600 border-stone-200';
  let dotColor = 'bg-stone-400';

  if (status === 'Available') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (status === 'Limited') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{text || (status === 'Available' ? 'Available Today' : status === 'Limited' ? 'Limited Hours' : 'Unavailable')}</span>
    </span>
  );
}
