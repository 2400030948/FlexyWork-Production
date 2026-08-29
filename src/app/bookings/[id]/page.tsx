'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, Clock, MapPin, IndianRupee,
  ShieldCheck, AlertCircle, Phone, MessageSquare, Play, CheckCircle,
  Users, UserCheck, Star, XCircle, CheckCircle2, RefreshCw, CreditCard, Loader2
} from 'lucide-react';
import { Gig, ShiftApplication, User } from '../../../types';
import StatusBadge from '../../../components/ui/StatusBadge';
import { getGigById, getShiftApplications, updateApplicationStatus } from '../../../services/gigs';
import {
  getRazorpayConfig,
  getShiftPayments
} from '../../../services/payments';
import { getMe } from '../../../services/auth';
import { usePayment } from '../../../components/payments/PaymentProvider';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gig, setGig] = useState<Gig | null>(null);
  const [applications, setApplications] = useState<ShiftApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [razorpayConfigured, setRazorpayConfigured] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'paid' | 'failed'>('unpaid');

  const gigId = params.id as string;
  const { payingShiftId, startPayment } = usePayment();
  const paying = payingShiftId === gigId;

  const fetchGigData = async () => {
    setLoading(true);
    const user = await getMe();
    setCurrentUser(user);

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const [gigData, appsData] = await Promise.all([
        getGigById(gigId),
        getShiftApplications(gigId)
      ]);
      setGig(gigData);
      setApplications(appsData);

      // Refresh payment status for this shift
      try {
        const shiftPayments = await getShiftPayments(gigId);
        if (shiftPayments.some((p) => p.status === 'completed')) {
          setPaymentStatus('paid');
        } else if (shiftPayments.some((p) => p.status === 'failed')) {
          setPaymentStatus('failed');
        }
      } catch {
        // ignore payment lookup errors; UI will fall back to default state
      }
    } catch (e) {
      console.error('Failed to load booking details', e);
    } finally {
      setLoading(false);
    }
  };

  // Detect whether Razorpay is configured on the server. We do this once on mount.
  useEffect(() => {
    let mounted = true;
    getRazorpayConfig()
      .then((cfg) => {
        if (!mounted) return;
        setRazorpayConfigured(Boolean(cfg.configured && cfg.keyId));
      })
      .catch(() => {
        if (!mounted) return;
        setRazorpayConfigured(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleRazorpayPayment = async () => {
    if (!gig) return;
    const opened = await startPayment(gig.id, gig.title, gig.paymentAmount, gig.checkInTime);
    if (opened) {
      await fetchGigData();
    }
  };

  const canPayWithRazorpay = Boolean(
    gig?.checkInTime &&
    paymentStatus !== 'paid' &&
    razorpayConfigured
  );

  useEffect(() => {
    if (gigId) {
      fetchGigData();
      const interval = setInterval(fetchGigData, 30000);
      return () => clearInterval(interval);
    }
  }, [gigId]);

  const handleApplicationAction = async (applicationId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
      await fetchGigData();
    } catch (err: any) {
      alert(err.message || 'Failed to update application');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !gig) {
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
        <Link href="/posted-gigs" className="inline-block rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 text-xs font-bold shadow-sm">
          Back to Posted Gigs
        </Link>
      </div>
    );
  }

  const isAssigned = (gig.assignedWorkerIds && gig.assignedWorkerIds.length > 0) || 
                     ['filled', 'in_progress', 'completed', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(gig.status);

  // Helper to determine step status
  const getStepStatus = (stepName: 'requested' | 'accepted' | 'working' | 'completed') => {
    const current = gig.status.toLowerCase();
    if (stepName === 'requested') return 'done';
    
    if (stepName === 'accepted') {
      if (isAssigned) return 'done';
      return 'pending';
    }
    
    if (stepName === 'working') {
      if (['in_progress', 'completed', 'completed'].includes(current) || gig.checkInTime) return 'done';
      if (isAssigned) return 'current';
      return 'pending';
    }

    if (stepName === 'completed') {
      if (paymentStatus === 'paid' || gig.paymentStatus === 'paid') return 'done';
      if (gig.checkInTime) return 'current';
      return 'pending';
    }
    return 'pending';
  };

  const pendingApps = applications.filter(a => a.status === 'pending');
  const acceptedApps = applications.filter(a => a.status === 'accepted');

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 page-enter">
      
      {/* Top Navigation */}
      <div className="flex justify-between items-center border-b border-surface-border pb-4">
        <Link href="/posted-gigs" className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={14} /> Back to Posted Shifts
        </Link>
        <button
          onClick={fetchGigData}
          className="p-2 bg-white border border-surface-border hover:bg-stone-50 text-ink-muted hover:text-ink rounded-lg transition-all shadow-2xs btn-press"
          title="Refresh Data"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Main Details Panel */}
      <div className="bg-white border border-surface-border rounded-xl p-6 shadow-2xs space-y-6">
        
        {/* Title and Category */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-xxs font-bold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded uppercase tracking-wider">
              {gig.category}
            </span>
            <h1 className="text-2xl font-bold text-ink tracking-tight mt-1.5">{gig.title}</h1>
            <p className="text-xs text-ink-muted mt-0.5 font-medium">Shift Reference: #{gig.id.slice(-6)}</p>
          </div>
          <StatusBadge status={gig.status} />
        </div>

        {/* Dynamic Timeline of Work */}
        <div className="border-t border-b border-surface-border py-6 my-2 space-y-6">
          <h3 className="text-xs font-extrabold text-ink uppercase tracking-wider">Service Execution Timeline</h3>
          
          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-200">
            
            {/* Step 1: Requested */}
            <div className="relative">
              <span className="absolute -left-[20px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 border border-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <div>
                <p className="text-xs font-bold text-ink">1. Gig Requirement Published</p>
                <p className="text-[10px] text-ink-muted mt-0.5">Order live across the FlexyWork worker network.</p>
              </div>
            </div>

            {/* Step 2: Accepted / Confirmed */}
            <div className="relative">
              <span className={`absolute -left-[20px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white ${
                getStepStatus('accepted') === 'done' ? 'bg-emerald-500' : 'bg-stone-200'
              }`}>
                {getStepStatus('accepted') === 'done' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <div>
                <p className={`text-xs font-bold ${getStepStatus('accepted') === 'done' ? 'text-ink' : 'text-ink-subtle'}`}>
                  2. Worker Matched & Confirmed
                </p>
                {getStepStatus('accepted') === 'done' ? (
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    ✓ Worker confirmed and assigned. Service contract locked.
                  </p>
                ) : pendingApps.length > 0 ? (
                  <p className="text-[10px] text-amber-700 font-bold mt-0.5">
                    🔔 {pendingApps.length} worker applicant{pendingApps.length > 1 ? 's' : ''} awaiting your review below!
                  </p>
                ) : (
                  <p className="text-[10px] text-ink-subtle mt-0.5">
                    Waiting for nearby workers to apply or confirm.
                  </p>
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
                  3. Service In Progress (On-Site)
                </p>
                {gig.checkInTime ? (
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    Worker arrived on-site and checked in via GPS at <strong className="text-ink">{gig.checkInTime}</strong>.
                  </p>
                ) : (
                  <p className="text-[10px] text-ink-subtle mt-0.5">Waiting for worker to check in on location.</p>
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
                  4. Payment & Completion
                </p>
                {paymentStatus === 'paid' || gig.paymentStatus === 'paid' ? (
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    ✓ Payment received via Razorpay. Shift is fully complete and worker has been paid.
                  </p>
                ) : gig.checkInTime ? (
                  <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                    Worker checked in. Complete Razorpay payment below to finish this shift.
                  </p>
                ) : (
                  <p className="text-[10px] text-ink-subtle mt-0.5">
                    Waiting for worker OTP check-in before payment can be collected.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* APPLICANT REVIEW SECTION (EMPLOYER APPROVAL ACTION) */}
        {pendingApps.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
                  <UserCheck size={18} className="text-amber-600" />
                  Worker Applicants Awaiting Your Approval ({pendingApps.length})
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Review applicant profile details and click <strong>Accept & Confirm</strong> to assign them to this shift.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {pendingApps.map(app => (
                <div
                  key={app.id}
                  className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center border border-brand-200 shrink-0">
                      {app.worker?.name ? app.worker.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'W'}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                        {app.worker?.name || 'Verified Worker'}
                        {app.profile?.isVerified && (
                          <span title="Identity & Background Verified">
                            <ShieldCheck size={14} className="text-emerald-500" />
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-ink-muted">
                        {app.worker?.location || 'Local Collective Member'} · Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-amber-700 font-semibold pt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          {app.profile?.rating || 4.9} Rating
                        </span>
                        <span>·</span>
                        <span>{app.profile?.reliabilityScore || 98}% Reliability</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleApplicationAction(app.id, 'accepted')}
                      disabled={actionLoading === app.id}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {actionLoading === app.id ? (
                        <span className="animate-pulse">Confirming...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={15} />
                          Accept & Confirm Worker
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleApplicationAction(app.id, 'rejected')}
                      disabled={actionLoading === app.id}
                      className="rounded-xl border border-surface-border bg-white hover:bg-rose-50 text-rose-600 px-3.5 py-2.5 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONFIRMED WORKER DETAILS CARD */}
        {isAssigned && (
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Confirmed Shift Worker
              </h3>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Staffing Confirmed
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center rounded-2xl text-base border border-brand-200 shrink-0">
                  {acceptedApps[0]?.worker?.name?.charAt(0) || 'W'}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-ink flex items-center gap-1.5">
                    {acceptedApps[0]?.worker?.name || 'Assigned Worker'}
                    <span title="Verified Worker">
                      <ShieldCheck size={14} className="text-emerald-500" />
                    </span>
                  </p>
                  <p className="text-xs text-ink-muted">
                    {gig.category} · Verified Shift Professional
                  </p>
                  <p className="text-xs font-extrabold text-brand-700 pt-0.5 flex items-center gap-1">
                    <Phone size={12} className="text-brand-500" />
                    {acceptedApps[0]?.worker?.phone || '+91 98765 43210'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <a 
                  href={`tel:${acceptedApps[0]?.worker?.phone || '+919876543210'}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs"
                  title="Call worker phone"
                >
                  <Phone size={13} />
                  Call Worker
                </a>
                <a 
                  href={`https://wa.me/${(acceptedApps[0]?.worker?.phone || '919876543210').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 rounded-xl text-xs font-bold transition-all shadow-xs"
                  title="Chat on WhatsApp"
                >
                  <MessageSquare size={13} />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* OTP Handshake Box */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                  🔐 Arrival Verification OTP (Step 3)
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Give this 4-digit code to the worker when they arrive at your location to verify on-site arrival and begin duty.
                </p>
              </div>
              <div className="bg-white border-2 border-dashed border-amber-400 px-5 py-2 rounded-xl text-xl font-black tracking-widest text-amber-900 shadow-sm shrink-0">
                {gig.checkInOtp || '8492'}
              </div>
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
              {gig.time || `${gig.startTime} - ${gig.endTime}`} ({gig.duration})
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

        {/* Razorpay Payout Section - shown to the employer once the shift is completed */}
        {currentUser && currentUser.role !== 'worker' && (
          <div className="bg-white border border-surface-border rounded-2xl p-5 mt-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#3399cc]/10 text-[#1f6fa6] flex items-center justify-center">
                  <CreditCard size={16} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-ink">Worker Payout</p>
                  <p className="text-[10px] text-ink-muted">Powered by Razorpay (Test Mode)</p>
                </div>
              </div>
              {paymentStatus === 'paid' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">
                  <CheckCircle2 size={12} /> Paid
                </span>
              ) : paymentStatus === 'failed' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded-full">
                  <AlertCircle size={12} /> Payment Failed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-full">
                  <Loader2 size={12} /> Pending
                </span>
              )}
            </div>

            {paymentStatus === 'paid' ? (
              <p className="text-[11px] text-emerald-800 font-semibold">
                ✓ Worker has been paid. A confirmation notification has been sent.
              </p>
            ) : gig.checkInTime ? (
              <>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  The worker verified arrival with the OTP. Secure the payout of{' '}
                  <strong className="text-ink">₹{gig.paymentAmount}</strong> via Razorpay.
                  The transaction is protected by backend signature verification.
                </p>
                <button
                  type="button"
                  onClick={handleRazorpayPayment}
                  disabled={paying || !razorpayConfigured}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f6fa6] hover:bg-[#155a8a] text-white px-5 py-2.5 text-xs font-extrabold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paying ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={14} />
                      Pay ₹{gig.paymentAmount} with Razorpay
                    </>
                  )}
                </button>
                {!razorpayConfigured && (
                  <p className="text-[10px] text-amber-700 font-semibold">
                    Razorpay is not configured on the server. Set RAZORPAY_KEY_ID and
                    RAZORPAY_KEY_SECRET in the server .env to enable online payouts.
                  </p>
                )}
              </>
            ) : (
              <p className="text-[11px] text-ink-muted">
                The worker must check in with the arrival OTP before payment can be collected
                via Razorpay.
              </p>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
