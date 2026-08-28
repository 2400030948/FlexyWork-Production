'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Clock, MapPin, IndianRupee, 
  Play, CheckCircle, Navigation, Radio, CheckSquare, Square,
  Hourglass, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';
import { Gig, User } from '../../../../types';
import { getGigById, recordAttendance, applyForGig } from '../../../../services/gigs';
import { getMe } from '../../../../services/auth';
import StatusBadge from '../../../../components/ui/StatusBadge';

export default function WorkerGigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [checklist, setChecklist] = useState<{ id: number; text: string; done: boolean }[]>([
    { id: 1, text: 'Confirm location GPS matches check-in radius', done: false },
    { id: 2, text: 'Perform primary scope requirements', done: false },
    { id: 3, text: 'Review quality standards with client', done: false },
    { id: 4, text: 'Secure final feedback signatures', done: false }
  ]);

  const gigId = params.id as string;

  const fetchGig = async () => {
    setLoading(true);
    const [user, data] = await Promise.all([
      getMe(),
      getGigById(gigId)
    ]);
    setCurrentUser(user);
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

  const handleApply = async () => {
    if (!gig) return;
    setActionLoading(true);
    try {
      await applyForGig(gig.id);
      await fetchGig();
    } catch (err: any) {
      alert(err.message || 'Could not submit application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (action: 'check-in' | 'check-out') => {
    if (!gig) return;
    setActionLoading(true);
    try {
      await recordAttendance(gig.id, action);
      await fetchGig();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
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

  const isAssigned = gig.assignedWorkerIds?.includes(currentUser?.id || '') || gig.applicationStatus === 'accepted';
  const isPending = gig.applicationStatus === 'pending';
  const isRejected = gig.applicationStatus === 'rejected';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      
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
            <p className="text-xs text-ink-subtle mt-1 font-semibold">Employer: {gig.employerName}</p>
          </div>
          <StatusBadge status={gig.status} />
        </div>

        {/* Dynamic Timeline Tracker */}
        <div className="border-t border-b border-surface-border py-5 flex items-center justify-around gap-2 text-center text-xs font-bold text-ink-subtle">
          <div className="space-y-1">
            <span className={`block h-2 w-2 rounded-full mx-auto ${isPending ? 'bg-amber-500 animate-pulse' : isAssigned ? 'bg-emerald-500' : 'bg-stone-300'}`} />
            <p className={isPending ? 'text-amber-700 font-extrabold' : isAssigned ? 'text-ink' : ''}>
              {isPending ? 'Under Review' : 'Applied'}
            </p>
          </div>
          <span className={`h-0.5 flex-grow ${isAssigned ? 'bg-emerald-500' : 'bg-stone-200'}`} />
          <div className="space-y-1">
            <span className={`block h-2 w-2 rounded-full mx-auto ${isAssigned ? 'bg-emerald-500' : 'bg-stone-200'}`} />
            <p className={isAssigned ? 'text-ink' : ''}>Approved & Confirmed</p>
          </div>
          <span className={`h-0.5 flex-grow ${
            ['IN_PROGRESS', 'COMPLETED', 'in_progress', 'completed'].includes(gig.status) ? 'bg-emerald-500' : 'bg-stone-200'
          }`} />
          <div className="space-y-1">
            <span className={`block h-2 w-2 rounded-full mx-auto ${
              ['IN_PROGRESS', 'COMPLETED', 'in_progress', 'completed'].includes(gig.status) ? 'bg-emerald-500' : 'bg-stone-200'
            }`} />
            <p className={['IN_PROGRESS', 'COMPLETED', 'in_progress', 'completed'].includes(gig.status) ? 'text-ink' : ''}>On-Site (In-Progress)</p>
          </div>
          <span className={`h-0.5 flex-grow ${
            ['COMPLETED', 'completed'].includes(gig.status) ? 'bg-emerald-500' : 'bg-stone-200'
          }`} />
          <div className="space-y-1">
            <span className={`block h-2 w-2 rounded-full mx-auto ${
              ['COMPLETED', 'completed'].includes(gig.status) ? 'bg-emerald-500' : 'bg-stone-200'
            }`} />
            <p className={['COMPLETED', 'completed'].includes(gig.status) ? 'text-ink' : ''}>Completed & Paid</p>
          </div>
        </div>

        {/* STATE 1: PENDING REVIEW BANNER */}
        {isPending && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs uppercase tracking-wider">
              <Hourglass size={14} className="animate-spin-slow text-amber-600" />
              Application Under Review by Employer
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Your profile has been submitted to <strong>{gig.employerName}</strong>. Once they approve your credentials, you will receive an acceptance notification and full duty location instructions.
            </p>
          </div>
        )}

        {/* STATE 2: DECLINED BANNER */}
        {isRejected && (
          <div className="bg-stone-100 border border-stone-200 rounded-2xl p-5 space-y-1 text-xs text-ink-muted">
            <p className="font-bold text-ink flex items-center gap-1.5">
              <XCircle size={14} className="text-rose-500" />
              Application Not Selected
            </p>
            <p>The employer selected another candidate for this shift. Check available gigs to apply for other opportunities.</p>
          </div>
        )}

        {/* STATE 3: CAN APPLY BUTTON */}
        {!isAssigned && !isPending && !isRejected && (
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-extrabold text-brand-800 text-sm flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-500" />
                Open Shift Available
              </h3>
              <p className="text-xs text-brand-700 font-medium mt-1">
                Submit your verified worker profile for the employer to review and approve.
              </p>
            </div>
            <button
              onClick={handleApply}
              disabled={actionLoading}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 text-xs font-extrabold transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              {actionLoading ? 'Submitting...' : 'Apply for Gig →'}
            </button>
          </div>
        )}

        {/* STATE 4: ASSIGNED / ON-DUTY HUD */}
        {isAssigned && (
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-extrabold text-brand-800 text-sm flex items-center gap-1.5">
                <Radio size={14} className="text-brand-500 animate-pulse" />
                Duty Location Matcher Active
              </h3>
              <p className="text-xxs text-brand-600 font-semibold mt-1">
                {!gig.checkInTime && 'Check in when you arrive on site to log verified attendance.'}
                {gig.checkInTime && !gig.checkOutTime && `Checked in at ${gig.checkInTime}. Check out when service is finished.`}
                {gig.checkOutTime && `Shift finished at ${gig.checkOutTime}. Payout recorded.`}
              </p>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              {!gig.checkInTime && (
                <button
                  onClick={() => handleAction('check-in')}
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-5 py-3 text-xs font-bold transition-all shadow shadow-brand-500/10"
                >
                  <Play size={14} /> Check In
                </button>
              )}
              {gig.checkInTime && !gig.checkOutTime && (
                <button
                  onClick={() => handleAction('check-out')}
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-xs font-bold transition-all shadow"
                >
                  <CheckCircle size={14} /> Check Out & Finish
                </button>
              )}
              {gig.checkOutTime && (
                <span className="w-full inline-flex items-center justify-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl px-4 py-2.5 text-xs font-bold">
                  <CheckCircle size={13} /> Payout Disbursed
                </span>
              )}
            </div>
          </div>
        )}

        {/* Work Checklist Section */}
        {isAssigned && !gig.checkOutTime && (
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
              <Clock size={13} /> {gig.time || `${gig.startTime} - ${gig.endTime}`} ({gig.duration})
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-ink-subtle block uppercase font-bold">Work Address</span>
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
