import React from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, ArrowRight, MapPin } from 'lucide-react';
import { WorkerProfile } from '../../types';

interface ProviderCardProps {
  provider: WorkerProfile;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-surface-border bg-white p-5 shadow-2xs hover:border-stone-300 hover:shadow-xs card-interactive transition-all">
      
      {/* Top Banner Details */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-sm border border-brand-100 shrink-0">
            {provider.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-ink leading-tight hover:text-brand-600 transition-colors">
                <Link href={`/providers/${provider.id}`}>{provider.name}</Link>
              </h3>
              {provider.isVerified && (
                <span title="Verified Worker">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-ink-muted">{provider.skills[0] || 'Flexible Service'}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Available
              </span>
            </div>
          </div>
        </div>

        {/* Price Tag */}
        <div className="text-right shrink-0">
          <span className="text-base font-black text-ink">₹{provider.hourlyRate}</span>
          <span className="text-xxs text-ink-subtle block">/ hr</span>
        </div>
      </div>

      {/* Bio / Description */}
      <p className="text-xs text-ink-muted line-clamp-2 my-3.5 leading-relaxed flex-grow">
        {provider.bio || 'Experienced and reliable local independent worker available for shifts.'}
      </p>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between border-t border-surface-border/70 pt-3 mt-auto text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 font-semibold text-ink">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span>{provider.rating > 0 ? provider.rating.toFixed(1) : '4.9'}</span>
            <span className="text-xxs text-ink-subtle font-normal">({provider.completedGigsCount || 12} completed)</span>
          </div>
          <div className="flex items-center gap-1 text-xxs text-ink-subtle">
            <MapPin size={11} className="text-stone-400" />
            <span>
              {provider.location || 'Indiranagar'}
              {typeof provider.distance === 'number' && Number.isFinite(provider.distance)
                ? ` · ${provider.distance} km`
                : ''}
            </span>
          </div>
        </div>

        <Link 
          href={`/providers/${provider.id}`}
          className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-all"
        >
          View Profile
          <ArrowRight size={11} />
        </Link>
      </div>

    </div>
  );
}

