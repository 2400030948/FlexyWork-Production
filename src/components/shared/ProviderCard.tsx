import React from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { WorkerProfile } from '../../types';
import LocationBadge from '../ui/LocationBadge';

interface ProviderCardProps {
  provider: WorkerProfile;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-surface-border bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-brand-200">
      
      {/* Top Banner Details */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-lg border border-brand-100 shrink-0">
            {provider.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-ink leading-tight hover:text-brand-600 transition-colors">
              <Link href={`/providers/${provider.id}`}>{provider.name}</Link>
            </h3>
            <p className="text-xs text-brand-600 font-semibold mt-0.5">{provider.skills[0] || 'Household Helper'}</p>
          </div>
        </div>

        {/* Price Tag */}
        <div className="text-right shrink-0">
          <p className="text-lg font-extrabold text-ink">₹{provider.hourlyRate}</p>
          <p className="text-xxs text-ink-subtle font-medium uppercase tracking-wider">per hour</p>
        </div>
      </div>

      {/* Trust Badges Bar */}
      <div className="flex flex-wrap gap-1.5 mt-3.5">
        {provider.isVerified && (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-100">
            <ShieldCheck size={11} /> Verified
          </span>
        )}
        {provider.isTopRated && (
          <span className="inline-flex items-center gap-1 rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800 border border-brand-100">
            <Sparkles size={11} /> Top Rated
          </span>
        )}
        {provider.responseTime && (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-100">
            <Zap size={11} /> Fast Responder
          </span>
        )}
      </div>

      {/* Bio / Description */}
      <p className="text-sm text-ink-muted line-clamp-2 my-4 flex-grow">
        {provider.bio}
      </p>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between border-t border-surface-border pt-4 mt-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-ink">{provider.rating.toFixed(1)}</span>
            <span className="text-xs text-ink-subtle font-medium">({provider.completedGigsCount} gigs)</span>
          </div>
          <LocationBadge distance={provider.distance} location={provider.location} />
        </div>

        <Link 
          href={`/providers/${provider.id}`}
          className="inline-flex items-center justify-center gap-1 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-all"
        >
          View Profile
          <ArrowRight size={12} />
        </Link>
      </div>

    </div>
  );
}
