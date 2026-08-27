import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-stone-200 bg-stone-50/50 rounded-2xl my-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-stone-500 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-ink text-base">{title}</h3>
      <p className="text-sm text-ink-muted mt-1 max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
