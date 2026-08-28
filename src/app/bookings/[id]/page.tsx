'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Clock, MapPin, IndianRupee, 
  ShieldCheck, AlertCircle, Phone, MessageSquare, Play, CheckCircle 
} from 'lucide-react';
import { Gig } from '../../../types';
import StatusBadge from '../../../components/ui/StatusBadge';
import { getGigById } from '../../../services/gigs';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);

  const gigId = params.id as string;

  useEffect(() => {
    const fetchGig = async () => {
      setLoading(true);
      const data = await getGigById(gigId);
      setGig(data);
      setLoading(false);
    };
    if (gigId) {
      fetchGig();
    }
  }, [gigId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center animate-pulse space-y-4">
        <div className="h-6 w-48 bg-stone-200 rounded mx-auto" />
        <div className="h-24 bg-stone-100 rounded-2xl" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-bold text-ink">Booking not found</h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          The requested service order could not be located in our systems.
        </p>
        <Link href="/bookings" className="inline-block rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 text-xs font-bold shadow-sm">
          Back to Bookings
        </Link>
      </div>
    );
  }

  // Helper to determine step status
  const getStepStatus = (stepName: 'requested' | 'accepted' | 'working' | 'completed') => {
    const current = gig.status.toUpperCase();
    if (stepName === 'requested') return 'done';
    
    if (stepName === 'accepted') {
      if (['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(current)) return 'done';
      return 'pending';
    }
    
    if (stepName === 'working') {
      if (['IN_PROGRESS', 'COMPLETED'].includes(current)) return 'done';
      if (current === 'ACCEPTED') return 'current';
      return 'pending';
    }

    if (stepName === 'completed') {
      if (current === 'COMPLETED') return 'done';
      if (current === 'IN_PROGRESS') return 'current';
      return 'pending';
    }
    return 'pending';
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Back CTA */}
      <Link href="/bookings" className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink transition-colors">
        <ArrowLeft size={14} /> Back to bookings
      </Link>

      {/* Main Details Panel */}
      <div className="bg-white border border-surface-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Title and Category */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {gig.category}
            </span>
            <h1 className="text-2xl font-extrabold text-ink tracking-tight mt-2">{gig.title}</h1>
            <p className="text-xs text-ink-subtle mt-1 font-semibold">Booking ID: {gig.id}</p>
          </div>
          <StatusBadge status={gig.status} />
        </div>

        {/* Dynamic Timeline of Work (Check-in/out visualizer) */}
        <div className="border-t border-b border-surface-border py-6 my-2 space-y-6">
          <h3 className="text-xs font-extrabold text-ink uppercase tracking-wider">Service Execution Timeline</h3>
          
          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-200">
            {/* Step 1: Requested */}
            <div className="relative">
              <span className="absolute -left-[20px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 border border-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <div>
                <p className="text-xs font-bold text-ink">Request Submitted</p>
                <p className="text-[10px] text-ink-muted mt-0.5">Gig order published to the network. Payout pool locked.</p>
              </div>
            </div>

            {/* Step 2: Accepted */}
            <div className="relative">
              <span className={`absolute -left-[20px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white ${
                getStepStatus('accepted') === 'done' ? 'bg-emerald-500' : 'bg-stone-200'
              }`}>
                {getStepStatus('accepted') === 'done' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <div>
                <p className={`text-xs font-bold ${getStepStatus('accepted') === 'done' ? 'text-ink' : 'text-ink-subtle'}`}>
                  Worker Mathed & Confirmed
                </p>
                {getStepStatus('accepted') === 'done' ? (
                  <p className="text-[10px] text-ink-muted mt-0.5">Assigned to Priya Sharma. Service contract locked.</p>
                ) : (
                  <p className="text-[10px] text-ink-subtle mt-0.5">Waiting for provider confirmation.</p>
                )}
              </div>
            </div>

            {/* Step 3: Check-in / Working */}
            <div className="relative">
              <span className={`absolute -left-[20px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white ${
                getStepStatus('working') === 'done' 
                  ? 'bg-emerald-500' 
                  : getStepStatus('working') === 'current'
                  ? 'bg-brand-500 animate-pulse'
                  : 'bg-stone-200'
              }`}>
                {getStepStatus('working') === 'done' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <div>
                <p className={`text-xs font-bold ${
                  getStepStatus('working') === 'done' ? 'text-ink' : getStepStatus('working') === 'current' ? 'text-brand-600 font-extrabold' : 'text-ink-subtle'
                }`}>
                  Service In Progress (Arrived)
                </p>
                {gig.checkInTime ? (
                  <p className="text-[10px] text-ink-muted mt-0.5">
                    Worker checked in at location using GPS at <strong className="text-ink">{gig.checkInTime}</strong>.
                  </p>
                ) : (
                  <p className="text-[10px] text-ink-subtle mt-0.5">Waiting for worker to check-in on location.</p>
                )}
              </div>
            </div>

            {/* Step 4: Finished */}
            <div className="relative">
              <span className={`absolute -left-[20px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white ${
                getStepStatus('completed') === 'done' 
                  ? 'bg-emerald-500' 
                  : getStepStatus('completed') === 'current'
                  ? 'bg-brand-500 animate-pulse'
                  : 'bg-stone-200'
              }`}>
                {getStepStatus('completed') === 'done' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <div>
                <p className={`text-xs font-bold ${
                  getStepStatus('completed') === 'done' ? 'text-ink' : getStepStatus('completed') === 'current' ? 'text-brand-600 font-extrabold' : 'text-ink-subtle'
                }`}>
                  Completed & Verified
                </p>
                {gig.checkOutTime ? (
                  <p className="text-[10px] text-ink-muted mt-0.5">
                    Completed at <strong className="text-ink">{gig.checkOutTime}</strong>. Payout transferred to worker wallet.
                  </p>
                ) : (
                  <p className="text-[10px] text-ink-subtle mt-0.5">Waiting for check-out trigger.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Worker Details Card if assigned */}
        {gig.assignedWorkerIds.length > 0 && (
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center rounded-xl text-sm border border-brand-200">
                PS
              </div>
              <div>
                <p className="text-xs font-bold text-ink">Priya Sharma</p>
                <p className="text-[10px] text-ink-muted mt-0.5">Home Cleaning Specialist · 4.9/5</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => alert('Simulated Voice Call initiated.')}
                className="p-2 bg-white border border-surface-border text-ink hover:text-brand-500 rounded-xl transition-all shadow-sm"
                title="Call worker"
              >
                <Phone size={14} />
              </button>
              <button 
                onClick={() => alert('Simulated Chat initiated.')}
                className="p-2 bg-white border border-surface-border text-ink hover:text-brand-500 rounded-xl transition-all shadow-sm"
                title="Message worker"
              >
                <MessageSquare size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Gig Meta grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-ink border-t border-surface-border pt-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-subtle block">Date</span>
            <span className="flex items-center gap-1 text-ink-muted">
              <Calendar size={13} />
              {gig.date}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-subtle block">Shift Time</span>
            <span className="flex items-center gap-1 text-ink-muted">
              <Clock size={13} />
              {gig.time}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-subtle block">Location Address</span>
            <span className="flex items-center gap-1 text-ink-muted truncate max-w-[200px]">
              <MapPin size={13} className="shrink-0" />
              {gig.location}
            </span>
          </div>
        </div>

        {/* Task description */}
        <div className="space-y-1.5 border-t border-surface-border pt-6">
          <span className="text-[10px] uppercase font-bold text-ink-subtle block">Job Description</span>
          <p className="text-xs text-ink-muted leading-relaxed italic">{gig.description}</p>
        </div>

        {/* Price Breakdowns */}
        <div className="flex justify-between items-center bg-brand-50 border border-brand-100 p-4 rounded-2xl mt-4">
          <div>
            <p className="text-xs font-bold text-brand-700">Estimated Total Cost</p>
            <p className="text-[10px] text-brand-600 font-semibold uppercase tracking-wider">Locked in platform escrow</p>
          </div>
          <p className="text-2xl font-extrabold text-brand-700">₹{gig.paymentAmount}</p>
        </div>

      </div>

    </div>
  );
}
