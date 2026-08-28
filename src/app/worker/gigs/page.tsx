'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Briefcase, Calendar, RefreshCw, Search, SlidersHorizontal, 
  Sparkles, Zap, IndianRupee, MapPin, Clock, CheckCircle, 
  Users, CheckSquare, ShieldCheck, ArrowRight
} from 'lucide-react';
import { Gig, User } from '../../../types';
import { getGigs, getMyGigs, acceptGig, applyForGig } from '../../../services/gigs';
import GigCard from '../../../components/shared/GigCard';
import EmptyState from '../../../components/ui/EmptyState';
import { getMe } from '../../../services/auth';

const CATEGORIES = ['All', 'Cleaning', 'Repairs', 'Gardening', 'Cafe', 'Retail', 'Logistics', 'Events', 'General'];

function WorkerGigsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'confirmed' ? 'confirmed' : 
                     searchParams.get('tab') === 'completed' ? 'completed' : 'available';

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'confirmed' | 'completed'>(initialTab);
  
  // Data States
  const [availableGigs, setAvailableGigs] = useState<Gig[]>([]);
  const [myGigs, setMyGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

      // Open available gigs (not yet filled by current user or other full quotas)
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
    const interval = setInterval(fetchAllGigsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAccept = async (e: React.MouseEvent, gigId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActionLoading(gigId);
    try {
      await acceptGig(gigId);
      await fetchAllGigsData();
      setActiveTab('confirmed');
    } catch (err: any) {
      alert(err.message || 'Could not accept gig');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter available gigs
  const filteredAvailableGigs = availableGigs.filter((gig) => {
    // Check if worker already accepted or completed
    const isAssigned = gig.assignedWorkerIds?.includes(currentUser?.id || '');
    if (isAssigned) return false;

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

  const confirmedGigs = myGigs.filter(g => g.status !== 'COMPLETED' && g.status !== 'DECLINED');
  const completedGigs = myGigs.filter(g => g.status === 'COMPLETED' || g.status === 'DECLINED');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-surface-border p-6 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-1.5">
            <Briefcase size={13} /> Worker Opportunities & Schedules
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Find & Manage Gigs
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Browse open shift postings from local employers, accept instant bookings, and track your active duty.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAllGigsData}
            className="p-3 bg-white border border-surface-border hover:bg-stone-50 text-ink-muted hover:text-ink rounded-2xl transition-all shadow-sm"
            title="Refresh Live Gigs"
          >
            <RefreshCw size={16} />
          </button>
          <Link
            href="/worker"
            className="rounded-2xl border border-surface-border bg-white hover:bg-stone-50 text-ink px-4 py-2.5 text-xs font-bold transition-all shadow-sm"
          >
            Command Center →
          </Link>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-surface-border gap-2 sm:gap-6 overflow-x-auto pb-0.5">
        {[
          { id: 'available', label: 'Explore Available Gigs', count: filteredAvailableGigs.length },
          { id: 'confirmed', label: 'Confirmed & In-Progress Shifts', count: confirmedGigs.length },
          { id: 'completed', label: 'Completed History', count: completedGigs.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all shrink-0 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-ink-subtle hover:text-ink-muted'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-brand-100 text-brand-800' : 'bg-stone-100 text-ink-subtle'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: AVAILABLE GIGS DISCOVERY */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          
          {/* Search & Filter Controls */}
          <div className="bg-white border border-surface-border rounded-3xl p-5 shadow-sm space-y-4">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-subtle" size={18} />
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

          {/* Available Gigs Feed */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-44 bg-white border border-surface-border rounded-3xl" />
              ))}
            </div>
          ) : filteredAvailableGigs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No matching open gigs found"
              description="Employers frequently post new shifts throughout the day. Try clearing your filters or check back shortly."
              actionLabel="Clear All Search Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setOnlyUrgent(false);
                setMinPay(0);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAvailableGigs.map((gig) => {
                const filledCount = gig.assignedWorkerIds?.length || gig.filledCount || 0;
                const requiredCount = gig.workersRequired || 1;
                const spotsLeft = Math.max(0, requiredCount - filledCount);

                return (
                  <div
                    key={gig.id}
                    className="flex flex-col justify-between rounded-3xl border border-surface-border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-brand-300 space-y-4"
                  >
                    {/* Top Row: Category & Urgency */}
                    <div className="flex items-center justify-between border-b border-surface-border pb-3">
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
                        {gig.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {gig.urgency === 'urgent' && (
                          <span className="bg-rose-50 text-rose-700 border border-rose-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                            ⚡ Urgent
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                        </span>
                      </div>
                    </div>

                    {/* Title, Employer, and Scope */}
                    <div className="space-y-1.5 flex-grow">
                      <h3 className="font-extrabold text-ink text-base hover:text-brand-600 transition-colors">
                        <Link href={`/worker/gigs/${gig.id}`}>
                          {gig.title}
                        </Link>
                      </h3>
                      <p className="text-[11px] font-semibold text-brand-700">
                        Posted by {gig.employerName || 'Local Employer'}
                      </p>
                      <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                        {gig.description}
                      </p>
                    </div>

                    {/* Skills Chips */}
                    {gig.requiredSkills && gig.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {gig.requiredSkills.slice(0, 3).map(skill => (
                          <span key={skill} className="text-[10px] font-semibold bg-stone-100 text-ink-muted px-2 py-0.5 rounded-md">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted font-medium bg-stone-50/50 p-3 rounded-2xl border border-surface-border">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-ink-subtle shrink-0" />
                        <span>{gig.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-ink-subtle shrink-0" />
                        <span>{gig.time} ({gig.duration})</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <MapPin size={13} className="text-ink-subtle shrink-0" />
                        <span className="truncate">{gig.location}</span>
                      </div>
                    </div>

                    {/* AI Score Badge if available */}
                    {gig.matchScore && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50/60 border border-emerald-100 p-2 text-xs text-emerald-800 font-semibold">
                        <Sparkles size={13} className="text-emerald-600 shrink-0" />
                        <span>{gig.matchScore}% Match for your skills</span>
                      </div>
                    )}

                    {/* Footer: Payout & Accept CTA */}
                    <div className="flex items-center justify-between border-t border-surface-border pt-4 mt-2">
                      <div>
                        <p className="text-xl font-black text-ink flex items-center gap-0.5">
                          <IndianRupee size={16} className="text-ink-muted" />
                          {gig.paymentAmount}
                        </p>
                        <p className="text-[10px] text-ink-subtle font-medium uppercase tracking-wider">
                          {gig.paymentType === 'hourly' ? 'Hourly Rate' : 'Fixed Payout'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/worker/gigs/${gig.id}`}
                          className="rounded-xl border border-surface-border bg-white hover:bg-stone-50 text-ink px-3 py-2 text-xs font-bold transition-all shadow-xs"
                        >
                          Details
                        </Link>
                        <button
                          onClick={(e) => handleQuickAccept(e, gig.id)}
                          disabled={actionLoading === gig.id}
                          className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 text-xs font-extrabold shadow-sm transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          {actionLoading === gig.id ? 'Accepting...' : 'Accept Gig'}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: CONFIRMED & ACTIVE SHIFTS */}
      {activeTab === 'confirmed' && (
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-36 bg-white border rounded-3xl" />
            </div>
          ) : confirmedGigs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No confirmed upcoming shifts"
              description="You haven't accepted any pending shifts. Browse available gigs posted by employers to start earning."
              actionLabel="Browse Available Gigs"
              onAction={() => setActiveTab('available')}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
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

      {/* TAB 3: COMPLETED HISTORY */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-36 bg-white border rounded-3xl" />
            </div>
          ) : completedGigs.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No completed gigs logged yet"
              description="Finished shifts, GPS attendance logs, and completed payouts will be archived here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
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
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-xs font-semibold text-ink-subtle uppercase tracking-wider">Loading gigs portal...</div>}>
      <WorkerGigsContent />
    </Suspense>
  );
}
