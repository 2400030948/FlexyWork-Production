'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, MapPin, ChevronRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { Gig, WorkerVerificationStatus } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import { acceptGig, recordAttendance } from '../../services/gigs';
import { getMyVerificationStatus } from '../../services/providers';

interface GigCardProps {
  gig: Gig;
  viewMode: 'seeker' | 'worker';
  onActionComplete?: () => void;
}

export default function GigCard({ gig, viewMode, onActionComplete }: GigCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workerVerificationStatus, setWorkerVerificationStatus] = useState<WorkerVerificationStatus | null>(null);
  const isWorker = viewMode === 'worker';

  useEffect(() => {
    if (!isWorker) return;
    let cancelled = false;
    getMyVerificationStatus().then((res) => {
      if (cancelled) return;
      setWorkerVerificationStatus(res?.workerVerificationStatus || 'unverified');
    });
    return () => {
      cancelled = true;
    };
  }, [isWorker]);

  const verified = workerVerificationStatus === 'approved';
  const lockedReason =
    isWorker && !verified
      ? workerVerificationStatus === 'unverified'
        ? 'Upload a certificate to accept shifts.'
        : workerVerificationStatus === 'pending'
        ? 'Your certificate is under review.'
        : workerVerificationStatus === 'rejected'
        ? 'Your certificate was rejected.'
        : 'Verification required.'
      : '';

  const handleAccept = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!verified) {
      setError(lockedReason || 'Worker verification required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await acceptGig(gig.id);
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
    if (!verified) {
      setError(lockedReason || 'Worker verification required.');
      return;
    }
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
    if (!verified) {
      setError(lockedReason || 'Worker verification required.');
      return;
    }
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

  return (
    <div className="flex flex-col rounded-xl border border-surface-border bg-white p-5 shadow-2xs hover:border-stone-300 hover:shadow-xs card-interactive transition-all">
      {/* Category & Status Row */}
      <div className="flex items-center justify-between border-b border-surface-border/70 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xxs font-bold text-brand-700 bg-brand-50 border border-brand-100/80 px-2 py-0.5 rounded uppercase tracking-wider">
            {gig.category}
          </span>
          {gig.urgency === 'urgent' && (
            <span className="bg-amber-50 text-amber-800 border border-amber-200/80 rounded px-2 py-0.5 text-xxs font-bold uppercase tracking-wider">
              Urgent Shift
            </span>
          )}
          {isWorker && workerVerificationStatus === 'approved' && (
            <span className="inline-flex items-center gap-1 text-xxs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
              <ShieldCheck size={11} /> Verified
            </span>
          )}
        </div>
        <StatusBadge status={gig.status} />
      </div>

      {/* Title & Editorial Details */}
      <div className="flex-grow space-y-2">
        <div>
          <h3 className="font-bold text-ink leading-snug text-base hover:text-brand-600 transition-colors">
            <Link href={isWorker ? `/worker/gigs/${gig.id}` : `/bookings/${gig.id}`}>
              {gig.title}
            </Link>
          </h3>
          <p className="text-xs text-ink-muted line-clamp-2 mt-1 leading-relaxed">{gig.description}</p>
        </div>

        {/* Structured Editorial Metadata */}
        <div className="space-y-1 pt-1 text-xs text-ink-subtle">
          <div className="flex items-center gap-1.5 font-medium text-ink-muted">
            <Clock size={13} className="shrink-0 text-brand-600" />
            <span>
              {gig.date} · {gig.time} ({gig.duration})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="shrink-0 text-stone-400" />
            <span className="truncate">{gig.location}</span>
          </div>
        </div>
      </div>

      {/* Match Score Indicator (Worker View) */}
      {isWorker && gig.status === 'REQUESTED' && gig.matchScore && (
        <div
          className={`flex items-center justify-between rounded-lg px-3 py-2 my-3 text-xs border ${
            gig.matchScore >= 90
              ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900'
              : gig.matchScore >= 75
              ? 'bg-brand-50/80 border-brand-200/80 text-brand-900'
              : 'bg-amber-50/80 border-amber-200/80 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold">
            <span>{gig.matchScore}% Match</span>
          </div>
          <span className="text-xxs font-medium truncate max-w-[200px] opacity-90">
            {gig.matchReasons?.[0] || 'Matches your availability and skills'}
          </span>
        </div>
      )}

      {/* Verification lock notice (worker view) */}
      {isWorker && workerVerificationStatus !== null && !verified && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 my-2 text-xxs font-semibold text-amber-800 flex items-center gap-1.5">
          <ShieldCheck size={12} />
          Verification required to {gig.status === 'REQUESTED' ? 'accept' : gig.status === 'IN_PROGRESS' ? 'check out' : 'act on'} this shift.
          <Link href="/worker/profile" className="ml-auto underline">Fix now →</Link>
        </div>
      )}

      {/* Footer Payout and Actions */}
      <div className="flex items-center justify-between border-t border-surface-border/70 pt-3.5 mt-3">
        <div>
          <span className="text-base font-black text-ink">₹{gig.paymentAmount.toLocaleString('en-IN')}</span>
          <span className="text-xxs text-ink-subtle font-medium block">
            {gig.paymentType === 'hourly' ? 'Estimated Total' : 'Fixed Shift Pay'}
          </span>
        </div>

        {/* Dynamic CTAs */}
        <div className="flex gap-2">
          {isWorker ? (
            <>
              {gig.status === 'REQUESTED' && (
                <button
                  onClick={handleAccept}
                  disabled={loading || !verified}
                  title={!verified ? lockedReason : ''}
                  className="rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Accepting...' : 'Accept Shift'}
                </button>
              )}
              {(gig.status === 'ACCEPTED' || gig.status === 'filled') && (
                <Link
                  href={`/worker/gigs/${gig.id}`}
                  className="rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
                >
                  Check In →
                </Link>
              )}
              {gig.status === 'IN_PROGRESS' && (
                <button
                  onClick={handleCheckOut}
                  disabled={loading || !verified}
                  title={!verified ? lockedReason : ''}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Checking out...' : 'Check Out'}
                </button>
              )}
              {gig.status === 'COMPLETED' && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                  <CheckCircle size={13} /> Completed
                </span>
              )}
            </>
          ) : (
            <Link
              href={`/bookings/${gig.id}`}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-ink px-3 py-1.5 text-xs font-semibold transition-colors border border-surface-border"
            >
              Manage Shift
              <ChevronRight size={13} />
            </Link>
          )}
        </div>
      </div>

      {error && <p className="text-xxs text-rose-500 font-semibold mt-1.5 text-right">{error}</p>}
    </div>
  );
}