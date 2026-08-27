import React from 'react';
import Link from 'next/link';
import { Star, Users, Award, ArrowRight } from 'lucide-react';
import { Community } from '../../types';

interface CommunityCardProps {
  community: Community;
}

export default function CommunityCard({ community }: CommunityCardProps) {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-surface-border bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-brand-200">
      
      {/* Top Banner details */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-2xl shrink-0">
            {community.logo}
          </div>
          <div>
            <h3 className="font-bold text-ink leading-tight hover:text-brand-600 transition-colors">
              <Link href={`/community/${community.id}`}>{community.name}</Link>
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-ink-subtle">
              <span className="flex items-center gap-0.5">
                <Users size={12} />
                <strong>{community.memberCount}</strong> members
              </span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center gap-0.5">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <strong>{community.rating.toFixed(1)}</strong> rating
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-ink-muted line-clamp-3 mb-4 flex-grow">
        {community.description}
      </p>

      {/* Services offered labels */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {community.services.slice(0, 4).map((s) => (
          <span key={s} className="bg-stone-50 text-stone-600 border border-stone-200 rounded px-2 py-0.5 text-[10px] font-bold">
            {s}
          </span>
        ))}
        {community.services.length > 4 && (
          <span className="bg-stone-100 text-stone-700 rounded px-2 py-0.5 text-[10px] font-bold">
            +{community.services.length - 4} more
          </span>
        )}
      </div>

      {/* Payout & Earnings Footer */}
      <div className="flex items-center justify-between border-t border-surface-border pt-4 mt-auto">
        <div>
          <p className="text-xs text-ink-subtle font-medium uppercase tracking-wider">Collective Pool</p>
          <p className="text-sm font-extrabold text-ink">
            ₹{community.totalEarnings.toLocaleString('en-IN')} earned
          </p>
        </div>

        <Link
          href={`/community/${community.id}`}
          className="inline-flex items-center justify-center gap-1 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-all"
        >
          Enter Collective
          <ArrowRight size={12} />
        </Link>
      </div>

    </div>
  );
}
