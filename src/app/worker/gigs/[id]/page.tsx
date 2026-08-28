'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Clock, MapPin, IndianRupee, 
  Play, CheckCircle, Navigation, Radio, CheckSquare, Square,
  Hourglass, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Sparkles,
  KeyRound, AlertCircle
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
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
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

  const handleAction = async (action: 'check-in' | 'check-out', otp?: string) => {
    if (!gig) return;
    setActionLoading(true);
    setOtpError(null);
    try {
      await recordAttendance(gig.id, action, otp);
      setOtpInput('');
      await fetchGig();
    } catch (e: any) {
      setOtpError(e.message || 'Failed to update attendance');
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

  const isAssigned = gig.assignedWorkerIds?.includes(currentUser?.id || '') || 
                     gig.applicationStatus === 'accepted' ||
                     ['filled', 'in_progress', 'completed', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(gig.status);

  const isPending = gig.applicationStatus === 'pending' && !isAssigned;
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
            ['IN_PROGRESS', 'COMPLETED', 'in_progress', 'completed'].includes(gig.status) || gig.checkInTime ? 'bg-emerald-500' : 'bg-stone-200'
          }`} />
          <div className="space-y-1">
            <span className={`block h-2 w-2 rounded-full mx-auto ${
              ['IN_PROGRESS', 'COMPLETED', 'in_progress', 'completed'].includes(gig.status) || gig.checkInTime ? 'bg-emerald-500' : 'bg-stone-200'
            }`} />
            <p className={['IN_PROGRESS', 'COMPLETED', 'in_progress', 'completed'].includes(gig.status) || gig.checkInTime ? 'text-ink' : ''}>On-Site (In-Progress)</p>
          </div>
          <span className={`h-0.5 flex-grow ${
            ['COMPLETED', 'completed'].includes(gig.status) || gig.checkOutTime ? 'bg-emerald-500' : 'bg-stone-200'
          }`} />
          <div className="space-y-1">
            <span className={`block h-2 w-2 rounded-full mx-auto ${
              ['COMPLETED', 'completed'].includes(gig.status) || gig.checkOutTime ? 'bg-emerald-500' : 'bg-stone-200'
            }`} />
            <p className={['COMPLETED', 'completed'].includes(gig.status) || gig.checkOutTime ? 'text-ink' : ''}>Completed & Paid</p>
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

        {/* STATE 4: ASSIGNED / ON-DUTY OTP CHECK-IN HUD */}
        {isAssigned && (
          <div className="bg-brand-50/80 border border-brand-100 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-extrabold text-brand-900 text-sm flex items-center gap-1.5">
                  <Radio size={15} className="text-brand-600 animate-pulse" />
                  On-Site Handshake & Arrival Verification (Step 3)
                </h3>
                <p className="text-xs text-brand-700 mt-0.5 font-medium">
                  {!gig.checkInTime 
                    ? 'Ask the employer on-site for their 4-digit Arrival OTP to verify check-in and start shift.'
                    : !gig.checkOutTime 
                    ? `Checked in at ${gig.checkInTime}. Complete required tasks and check out below when finished.`
                    : `Shift finished at ${gig.checkOutTime}. Payout recorded.`}
                </p>
              </div>

              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                gig.checkInTime 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                {gig.checkInTime ? '✓ On-Duty Verified' : 'Awaiting On-Site OTP'}
              </span>
            </div>

            {/* OTP Entry Form if not yet checked in */}
            {!gig.checkInTime && (
              <div className="bg-white border border-brand-200/80 rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-grow">
                    <KeyRound size={16} className="absolute left-3.5 top-3 text-ink-subtle" />
                    <input
                      type="text"
                      maxLength={4}
                      value={otpInput}
                      onChange={(e) => {
                        setOtpInput(e.target.value);
                        setOtpError(null);
                      }}
                      placeholder="Enter 4-digit code (e.g. 8492)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink placeholder-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <button
                    onClick={() => handleAction('check-in', otpInput)}
                    disabled={actionLoading || otpInput.trim().length === 0}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    {actionLoading ? 'Verifying...' : (
                      <>
                        <CheckCircle2 size={15} />
                        Verify OTP & Check In
                      </>
                    )}
                  </button>
                </div>

                {otpError && (
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={13} />
                    {otpError}
                  </p>
                )}
              </div>
            )}

            {/* Check-out button when in-progress */}
            {gig.checkInTime && !gig.checkOutTime && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleAction('check-out')}
                  disabled={actionLoading}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-xs font-extrabold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle size={15} />
                  Check Out & Finish Shift
                </button>
              </div>
            )}

            {/* Completion Banner */}
            {gig.checkOutTime && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl p-4 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Shift Successfully Completed! Payout has been disbursed to your ledger.
              </div>
            )}
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
