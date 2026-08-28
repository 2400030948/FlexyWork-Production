'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, IndianRupee, Sparkles, ChevronRight, CheckCircle } from 'lucide-react';
import { Gig } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import { acceptGig, recordAttendance } from '../../services/gigs';

interface GigCardProps {
  gig: Gig;
  viewMode: 'seeker' | 'worker';
  onActionComplete?: () => void;
}

export default function GigCard({ gig, viewMode, onActionComplete }: GigCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError('');
    try {
      await acceptGig(gig.id, '');
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to accept gig.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await recordAttendance(gig.id, 'check-in');
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await recordAttendance(gig.id, 'check-out');
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isWorker = viewMode === 'worker';

  return (
    <div className="flex flex-col rounded-2xl border border-surface-border bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      
      {/* Category & Status Row */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3.5 mb-3.5">
        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          {gig.category}
        </span>
        <div className="flex items-center gap-2">
          {gig.urgency === 'urgent' && (
            <span className="bg-rose-50 text-rose-700 border border-rose-100 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse">
              Urgent
            </span>
          )}
          <StatusBadge status={gig.status} />
        </div>
      </div>

      {/* Title & Description */}
      <div className="flex-grow">
        <h3 className="font-bold text-ink leading-snug text-base mb-1.5 hover:text-brand-600 transition-colors">
          <Link href={isWorker ? `/worker/gigs/${gig.id}` : `/bookings/${gig.id}`}>
            {gig.title}
          </Link>
        </h3>
        <p className="text-sm text-ink-muted line-clamp-2 mb-4">
          {gig.description}
        </p>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-muted mb-4 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-ink-subtle" />
            <span>{gig.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-ink-subtle" />
            <span>{gig.time} ({gig.duration})</span>
          </div>
          <div className="flex items-center gap-1.5 sm:col-span-2">
            <MapPin size={14} className="text-ink-subtle shrink-0" />
            <span className="truncate">{gig.location}</span>
          </div>
        </div>
      </div>

      {/* AI Score Badge if matching on worker command center */}
      {isWorker && gig.status === 'REQUESTED' && gig.matchScore && (
        <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50/50 border border-emerald-100 p-2.5 mb-4 text-xs">
          <Sparkles size={14} className="text-emerald-600 animate-pulse shrink-0" />
          <span className="font-semibold text-emerald-800 shrink-0">{gig.matchScore}% Match Score</span>
          <span className="text-emerald-700 truncate pl-1 border-l border-emerald-200">
            {gig.matchReasons?.[0] || 'Good fit for your availability'}
          </span>
        </div>
      )}

      {/* Footer Payout and Actions */}
      <div className="flex items-center justify-between border-t border-surface-border pt-4 mt-auto">
        <div>
          <p className="text-lg font-extrabold text-ink flex items-center gap-0.5">
            <IndianRupee size={15} className="text-ink-muted" />
            {gig.paymentAmount}
          </p>
          <p className="text-[10px] text-ink-subtle font-medium uppercase tracking-wider">
            {gig.paymentType === 'hourly' ? 'Estimated Total' : 'Fixed Payout'}
          </p>
        </div>

        {/* Dynamic CTAs */}
        <div className="flex gap-2">
          {isWorker ? (
            <>
              {gig.status === 'REQUESTED' && (
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Accepting...' : 'Accept Gig'}
                </button>
              )}
              {gig.status === 'ACCEPTED' && (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Checking in...' : 'Check In'}
                </button>
              )}
              {gig.status === 'IN_PROGRESS' && (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Checking out...' : 'Check Out'}
                </button>
              )}
              {gig.status === 'COMPLETED' && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 flex items-center gap-1">
                  <CheckCircle size={13} /> Done & Paid
                </span>
              )}
            </>
          ) : (
            <Link
              href={`/bookings/${gig.id}`}
              className="inline-flex items-center justify-center gap-0.5 rounded-xl bg-surface-card hover:bg-stone-200 text-ink px-3.5 py-2 text-xs font-bold border border-surface-border transition-colors"
            >
              Details
              <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {error && <p className="text-xxs text-rose-500 font-semibold mt-2 text-right">{error}</p>}
    </div>
  );
}
