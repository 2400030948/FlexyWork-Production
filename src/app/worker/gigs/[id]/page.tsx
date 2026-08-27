'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Clock, MapPin, IndianRupee, 
  Play, CheckCircle, Navigation, Radio, CheckSquare, Square 
} from 'lucide-react';
import { db } from '../../mock/data';
import { Gig } from '../../types';
import { getGigById, recordAttendance } from '../../services/gigs';
import StatusBadge from '../../components/ui/StatusBadge';

export default function WorkerGigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState<{ id: number; text: string; done: boolean }[]>([
    { id: 1, text: 'Confirm location GPS matches check-in radius', done: false },
    { id: 2, text: 'Perform primary scope requirements', done: false },
    { id: 3, text: 'Review quality standards with client', done: false },
    { id: 4, text: 'Secure final feedback signatures', done: false }
  ]);

  const gigId = params.id as string;

  const fetchGig = async () => {
    setLoading(true);
    const data = await getGigById(gigId);
    setGig(data);
    setLoading(false);
  };

  useEffect(() => {
    if (gigId) {
      fetchGig();
    }
  }, [gigId]);

  const toggleChecklistItem = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleAction = async (action: 'check-in' | 'check-out') => {
    if (!gig) return;
    setLoading(true);
    try {
      await recordAttendance(gig.id, action);
      await fetchGig();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !gig) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center animate-pulse">
        <div className="h-6 w-48 bg-stone-200 rounded mx-auto mb-2" />
        <div className="h-24 bg-stone-100 rounded-2xl" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-ink">Gig Details Not Found</h2>
        <Link href="/worker/gigs" className="inline-block rounded-xl bg-brand-500 text-white px-4 py-2 text-xs font-bold">
          Return to Gigs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Back Link */}
      <Link href="/worker/gigs" className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink transition-colors">
        <ArrowLeft size={14} /> Back to gigs
      </Link>

      {/* Main Command Console Card */}
      <div className="bg-white border border-surface-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Title, Category & Status */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {gig.category}
            </span>
            <h1 className="text-2xl font-extrabold text-ink tracking-tight mt-2">{gig.title}</h1>
            <p className="text-xs text-ink-subtle mt-1 font-semibold">Client: {gig.employerName}</p>
          </div>
          <StatusBadge status={gig.status} />
        </div>

        {/* Dynamic Timeline Tracker */}
        <div className="border-t border-b border-surface-border py-5 flex items-center justify-around gap-2 text-center text-xs font-bold text-ink-subtle">
          <div className="space-y-1">
            <span className="block h-2 w-2 rounded-full bg-emerald-500 mx-auto" />
            <p className="text-ink">Confirmed</p>
          </div>
          <span className="h-0.5 flex-grow bg-emerald-500" />
          <div className="space-y-1">
            <span className={`block h-2 w-2 rounded-full mx-auto ${
              ['IN_PROGRESS', 'COMPLETED'].includes(gig.status) ? 'bg-emerald-500' : 'bg-stone-200'
            }`} />
            <p className={['IN_PROGRESS', 'COMPLETED'].includes(gig.status) ? 'text-ink' : ''}>Arrived (In-Progress)</p>
          </div>
          <span className={`h-0.5 flex-grow ${
            ['IN_PROGRESS', 'COMPLETED'].includes(gig.status) ? 'bg-emerald-500' : 'bg-stone-200'
          }`} />
          <div className={`space-y-1`}>
            <span className={`block h-2 w-2 rounded-full mx-auto ${
              gig.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-stone-200'
            }`} />
            <p className={gig.status === 'COMPLETED' ? 'text-ink' : ''}>Finished & Paid</p>
          </div>
        </div>

        {/* Dynamic Actions HUD */}
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-extrabold text-brand-800 text-sm flex items-center gap-1.5">
              <Radio size={14} className="text-brand-500 animate-pulse" />
              Duty Location Matcher Active
            </h3>
            <p className="text-xxs text-brand-600 font-semibold mt-1">
              {gig.status === 'ACCEPTED' && 'Check-in unlocks when within 500m of the work coordinate.'}
              {gig.status === 'IN_PROGRESS' && 'Check-out logs check-out time and updates your earnings balance.'}
              {gig.status === 'COMPLETED' && 'Earnings successfully recorded into your local wallet.'}
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            {gig.status === 'ACCEPTED' && (
              <button
                onClick={() => handleAction('check-in')}
                className="w-full inline-flex justify-center items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-5 py-3 text-xs font-bold transition-all shadow shadow-brand-500/10"
              >
                <Play size={14} /> Check In
              </button>
            )}
            {gig.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleAction('check-out')}
                className="w-full inline-flex justify-center items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-xs font-bold transition-all shadow"
              >
                <CheckCircle size={14} /> Check Out & Finish
              </button>
            )}
            {gig.status === 'COMPLETED' && (
              <span className="w-full inline-flex items-center justify-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl px-4 py-2.5 text-xs font-bold">
                ✓ Payout Disbursed
              </span>
            )}
          </div>
        </div>

        {/* Work Checklist Section */}
        {gig.status !== 'COMPLETED' && (
          <div className="space-y-3 border-t border-surface-border pt-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-ink-subtle">On-Duty Checklist</h3>
            <div className="space-y-2">
              {checklist.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex w-full items-center gap-3 p-3 border border-surface-border hover:bg-stone-50 rounded-xl text-left transition-all text-xs font-semibold text-ink-muted"
                >
                  {item.done ? (
                    <CheckSquare size={16} className="text-brand-500 shrink-0" />
                  ) : (
                    <Square size={16} className="text-stone-300 shrink-0" />
                  )}
                  <span className={item.done ? 'line-through text-ink-subtle' : ''}>{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Schedule & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-surface-border pt-6 text-xs font-semibold text-ink-muted">
          <div className="space-y-1">
            <span className="text-[10px] text-ink-subtle block uppercase font-bold">Schedule</span>
            <span className="flex items-center gap-1">
              <Clock size={13} /> {gig.time} ({gig.duration})
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-ink-subtle block uppercase font-bold">Client Address</span>
            <span className="flex items-center gap-1 truncate max-w-[200px]">
              <MapPin size={13} className="shrink-0" /> {gig.location}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-ink-subtle block uppercase font-bold">Client Coordinates</span>
            <span className="flex items-center gap-1">
              <Navigation size={13} /> Lat 16.506, Lon 80.648
            </span>
          </div>
        </div>

        {/* Payout Summary */}
        <div className="border-t border-surface-border pt-6 flex justify-between items-center text-sm">
          <div>
            <p className="text-xs text-ink-subtle font-medium uppercase tracking-wider">Gross Payout Est.</p>
            <p className="text-xxs text-ink-subtle font-semibold mt-0.5">Platform insurance & fee split precalculated</p>
          </div>
          <p className="text-2xl font-black text-ink flex items-center gap-0.5">
            <IndianRupee size={18} className="text-ink-muted" /> {gig.paymentAmount}
          </p>
        </div>

      </div>

    </div>
  );
}
