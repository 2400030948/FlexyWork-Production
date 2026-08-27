import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationBadgeProps {
  distance?: number;
  location: string;
  className?: string;
}

export default function LocationBadge({ distance, location, className = '' }: LocationBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded bg-stone-100 text-stone-700 px-2 py-0.5 text-xs font-medium ${className}`}>
      <MapPin size={12} className="text-stone-500 shrink-0" />
      <span className="truncate max-w-[140px]">{location}</span>
      {distance !== undefined && (
        <span className="border-l border-stone-200 pl-1 ml-1 text-stone-500 font-semibold shrink-0">
          {distance} km
        </span>
      )}
    </span>
  );
}
