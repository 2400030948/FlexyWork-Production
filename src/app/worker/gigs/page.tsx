'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Briefcase, Calendar, RefreshCw, Search, SlidersHorizontal, 
  Sparkles, Zap, IndianRupee, MapPin, Clock, CheckCircle, 
  Users, CheckSquare, ShieldCheck, ArrowRight, Hourglass, 
  CheckCircle2, XCircle, Bell, AlertCircle
} from 'lucide-react';
import { Gig, User } from '../../../types';
import { getGigs, getMyGigs, applyForGig, acceptGig } from '../../../services/gigs';
import GigCard from '../../../components/shared/GigCard';
import EmptyState from '../../../components/ui/EmptyState';
import { getMe } from '../../../services/auth';

const CATEGORIES = ['All', 'Cleaning', 'Repairs', 'Gardening', 'Cafe', 'Retail', 'Logistics', 'Events', 'General'];

function WorkerGigsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'confirmed' ? 'confirmed' : 
                     searchParams.get('tab') === 'applications' ? 'applications' :
                     searchParams.get('tab') === 'completed' ? 'completed' : 'available';

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'applications' | 'confirmed' | 'completed'>(initialTab);
  
  // Data States
  const [availableGigs, setAvailableGigs] = useState<Gig[]>([]);
  const [myGigs, setMyGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter States for Available Gigs
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [minPay, setMinPay] = useState<number>(0);

  const fetchAllGigsData = async () => {
    setLoading(true);
    const user = await getMe();
    setCurrentUser(user);

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const [opps, userShifts] = await Promise.all([
        getGigs(),
        getMyGigs(user.id, 'worker')
      ]);

      setAvailableGigs(opps);
      setMyGigs(userShifts);
    } catch (e) {
      console.error('Failed to fetch worker gigs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllGigsData();
    const interval = setInterval(fetchAllGigsData, 20000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Handle Applying for a Gig (Worker sends application for Employer to review)
  const handleApply = async (e: React.MouseEvent, gigId: string, gigTitle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActionLoading(gigId);
    try {
      await applyForGig(gigId);
      showToast(`Application submitted for "${gigTitle}"! Employer has been notified to review your profile.`);
      await fetchAllGigsData();
    } catch (err: any) {
      alert(err.message || 'Could not submit application');
    } finally {
      setActionLoading(null);
    }
  };

  // Check application status for a gig
  const getGigApplicationStatus = (gig: Gig): 'none' | 'pending' | 'accepted' | 'rejected' => {
    if (gig.assignedWorkerIds?.includes(currentUser?.id || '')) return 'accepted';
    if (gig.applicationStatus === 'accepted') return 'accepted';
    if (gig.applicationStatus === 'pending') return 'pending';
    if (gig.applicationStatus === 'rejected') return 'rejected';

    // Also check inside myGigs if recorded
    const inMyGigs = myGigs.find(g => g.id === gig.id);
    if (inMyGigs) {
      if (inMyGigs.assignedWorkerIds?.includes(currentUser?.id || '')) return 'accepted';
      if (inMyGigs.applicationStatus === 'accepted') return 'accepted';
      if (inMyGigs.applicationStatus === 'pending') return 'pending';
      if (inMyGigs.applicationStatus === 'rejected') return 'rejected';
    }

    return 'none';
  };

  // Filter available gigs
  const filteredAvailableGigs = availableGigs.filter((gig) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        gig.title.toLowerCase().includes(q) ||
        gig.description.toLowerCase().includes(q) ||
        gig.category.toLowerCase().includes(q) ||
        gig.location.toLowerCase().includes(q) ||
        gig.employerName.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && gig.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // Urgency filter
    if (onlyUrgent && gig.urgency !== 'urgent') {
      return false;
    }

    // Min Pay
    if (minPay > 0 && gig.paymentAmount < minPay) {
      return false;
    }

    return true;
  });

  // Buckets for Worker's Shifts & Applications
  const appliedGigs = myGigs.filter(g => {
    const isAssigned = g.assignedWorkerIds?.includes(currentUser?.id || '');
    return g.applicationStatus === 'pending' || (g.applicationStatus === 'accepted' && !isAssigned) || g.applicationStatus === 'rejected';
  });

  const confirmedGigs = myGigs.filter(g => {
    const isAssigned = g.assignedWorkerIds?.includes(currentUser?.id || '');
    const isCompleted = g.status === 'COMPLETED' || g.status === 'DECLINED';
    return (isAssigned || g.applicationStatus === 'accepted') && !isCompleted;
  });

  const completedGigs = myGigs.filter(g => {
    return g.status === 'COMPLETED' || g.status === 'DECLINED';
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-ink text-white p-4 rounded-2xl shadow-xl flex items-start gap-3 animate-in slide-in-from-top-4 duration-200 border border-white/10">
          <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
            ✓
          </div>
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-white">Status Update</p>
            <p className="text-stone-300 leading-relaxed">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Find Work That Fits Your Schedule
          </h1>
          <p className="text-xs text-ink-muted mt-0.5 font-medium">
            Browse open shifts in your neighborhood, apply with 1 tap, and track on-duty check-ins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllGigsData}
            className="p-2.5 bg-white border border-surface-border hover:bg-stone-50 text-ink-muted hover:text-ink rounded-lg transition-all shadow-2xs btn-press"
            title="Refresh Live Gigs"
          >
            <RefreshCw size={14} />
          </button>
          <Link
            href="/worker"
            className="rounded-lg border border-surface-border bg-white hover:bg-stone-50 text-ink px-3.5 py-2 text-xs font-semibold transition-all shadow-2xs btn-press"
          >
            ← Command Center
          </Link>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-surface-border gap-2 sm:gap-6 overflow-x-auto pb-0.5 text-xs">
        {[
          { id: 'available', label: 'Explore Available Shifts', count: filteredAvailableGigs.length },
          { id: 'applications', label: 'My Applications', count: appliedGigs.length },
          { id: 'confirmed', label: 'Confirmed & On-Duty', count: confirmedGigs.length },
          { id: 'completed', label: 'Completed History', count: completedGigs.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs font-bold border-b-2 transition-all shrink-0 flex items-center gap-1.5 btn-press ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-subtle hover:text-ink'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-brand-50 text-brand-800 border border-brand-200/80' : 'bg-stone-100 text-ink-subtle'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: EXPLORE AVAILABLE GIGS */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          
          {/* Search & Filter Toolbar */}
          <div className="rounded-3xl border border-surface-border bg-white p-5 shadow-sm space-y-4">
            
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-ink-subtle" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gigs by title, skills, employer, or location (e.g. 'Cafe', 'Indiranagar', 'Cleaning')..."
                className="w-full rounded-2xl border border-surface-border bg-stone-50/50 py-3 pl-12 pr-4 text-xs font-medium text-ink placeholder-ink-subtle focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-extrabold text-ink-subtle uppercase tracking-wider shrink-0 mr-1">
                Category:
              </span>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full border shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'bg-white text-ink-muted border-surface-border hover:bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Additional Filter Row: Urgent & Pay Slider */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-surface-border pt-3.5 text-xs text-ink-muted font-medium">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyUrgent}
                  onChange={(e) => setOnlyUrgent(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500 accent-brand-500"
                />
                <span className="font-bold text-rose-700 flex items-center gap-1">
                  <Zap size={14} className="fill-rose-500 text-rose-500" />
                  Show Urgent Gigs Only
                </span>
              </label>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-ink-subtle">Min. Pay:</span>
                <div className="flex gap-1">
                  {[0, 500, 800, 1200].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setMinPay(amt)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        minPay === amt
                          ? 'bg-brand-50 border-brand-300 text-brand-700 font-extrabold'
                          : 'bg-white border-surface-border text-ink-subtle hover:text-ink'
                      }`}
                    >
                      {amt === 0 ? 'All' : `₹${amt}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Available Shifts Feed */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-white border border-surface-border rounded-xl" />
              ))}
            </div>
          ) : filteredAvailableGigs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No matching open shifts found"
              description="Local employers post shifts regularly throughout the day. Try adjusting your search filters or check back shortly."
              actionLabel="Clear All Search Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setOnlyUrgent(false);
                setMinPay(0);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAvailableGigs.map((gig) => (
                <GigCard
                  key={gig.id}
                  gig={gig}
                  viewMode="worker"
                  onActionComplete={fetchAllGigsData}
                />
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: MY APPLICATIONS & EMPLOYER REVIEWS */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="bg-brand-50/70 border border-brand-200/80 rounded-xl p-4 flex items-center gap-3 text-xs text-brand-950">
            <Bell size={18} className="text-brand-600 shrink-0" />
            <div>
              <p className="font-bold">Two-Way Matching & Employer Review</p>
              <p className="text-ink-muted text-xxs mt-0.5 leading-relaxed">
                When you apply, the employer reviews your verified profile, skills, and reliability score. Once approved, the shift moves immediately to Confirmed Shifts for check-in.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-28 bg-white border rounded-xl" />
            </div>
          ) : appliedGigs.length === 0 ? (
            <EmptyState
              icon={Hourglass}
              title="No active applications"
              description="You haven't applied for any shifts yet. Explore open employer listings to submit your profile for review."
              actionLabel="Explore Available Shifts"
              onAction={() => setActiveTab('available')}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {appliedGigs.map(g => {
                const isAccepted = g.applicationStatus === 'accepted' || g.assignedWorkerIds?.includes(currentUser?.id || '');
                const isRejected = g.applicationStatus === 'rejected';
                const isPending = !isAccepted && !isRejected;

                return (
                  <div
                    key={g.id}
                    className="bg-white border border-surface-border rounded-xl p-5 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-stone-300 transition-all card-interactive"
                  >
                    <div className="space-y-1.5 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="text-xxs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded uppercase">
                          {g.category}
                        </span>
                        
                        {/* Status Badges */}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded text-xxs font-bold uppercase">
                            <Hourglass size={11} className="animate-spin-slow text-amber-600" />
                            Under Employer Review
                          </span>
                        )}
                        {isAccepted && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-xxs font-bold uppercase">
                            <CheckCircle2 size={11} className="text-emerald-600" />
                            Approved by Employer
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 bg-stone-100 text-ink-subtle px-2 py-0.5 rounded text-xxs font-bold uppercase">
                            <XCircle size={11} className="text-stone-400" />
                            Not Selected
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-ink">
                        <Link href={`/worker/gigs/${g.id}`} className="hover:text-brand-600 transition-colors">
                          {g.title}
                        </Link>
                      </h3>
                      
                      <p className="text-xs text-ink-muted">
                        Employer: <strong className="text-ink">{g.employerName}</strong> · Schedule: <strong className="text-ink">{g.date} ({g.time || `${g.startTime} - ${g.endTime}`})</strong> · Location: <strong className="text-ink">{g.location}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-surface-border">
                      <div className="text-right">
                        <span className="text-base font-black text-ink">₹{g.paymentAmount}</span>
                        <span className="text-xxs text-ink-subtle font-medium block uppercase">{g.paymentType === 'hourly' ? '/ hr' : 'Fixed'}</span>
                      </div>

                      {isAccepted ? (
                        <button
                          onClick={() => setActiveTab('confirmed')}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-2xs transition-all flex items-center gap-1 btn-press"
                        >
                          <CheckCircle2 size={13} />
                          Go to Shift
                        </button>
                      ) : (
                        <Link
                          href={`/worker/gigs/${g.id}`}
                          className="rounded-lg border border-surface-border bg-stone-50 hover:bg-stone-100 text-ink px-3 py-2 text-xs font-semibold transition-all shadow-2xs btn-press"
                        >
                          View Shift Details →
                        </Link>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONFIRMED & ACTIVE SHIFTS */}
      {activeTab === 'confirmed' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              <div className="h-44 bg-white border border-surface-border rounded-xl" />
              <div className="h-44 bg-white border border-surface-border rounded-xl" />
            </div>
          ) : confirmedGigs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No confirmed upcoming shifts"
              description="Once an employer approves your application, your confirmed shifts will appear here for GPS check-in and on-duty tracking."
              actionLabel="Browse Available Shifts"
              onAction={() => setActiveTab('available')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {confirmedGigs.map(g => (
                <GigCard 
                  key={g.id} 
                  gig={g} 
                  viewMode="worker" 
                  onActionComplete={fetchAllGigsData} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COMPLETED HISTORY */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              <div className="h-44 bg-white border border-surface-border rounded-xl" />
              <div className="h-44 bg-white border border-surface-border rounded-xl" />
            </div>
          ) : completedGigs.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No completed shifts logged yet"
              description="Finished shifts, GPS attendance logs, and completed payouts will be archived here."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedGigs.map(g => (
                <GigCard 
                  key={g.id} 
                  gig={g} 
                  viewMode="worker" 
                  onActionComplete={fetchAllGigsData} 
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default function WorkerGigsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-ink-subtle">Loading Gigs Hub...</div>}>
      <WorkerGigsContent />
    </Suspense>
  );
}
