'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Briefcase, Plus, Calendar, Clock, MapPin, IndianRupee, 
  Users, RefreshCw, CheckCircle, XCircle, AlertCircle, 
  ChevronDown, ChevronUp, UserCheck, ShieldCheck, Star, Radio
} from 'lucide-react';
import { Gig, ShiftApplication, User } from '../../types';
import { getMe } from '../../services/auth';
import { getMyGigs, getShiftApplications, updateApplicationStatus } from '../../services/gigs';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

export default function PostedGigsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'active' | 'completed'>('all');

  // Expanded applicants per gig
  const [expandedGigId, setExpandedGigId] = useState<string | null>(null);
  const [applicationsMap, setApplicationsMap] = useState<Record<string, ShiftApplication[]>>({});
  const [appsLoading, setAppsLoading] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchGigsData = async () => {
    setLoading(true);
    const user = await getMe();
    setCurrentUser(user);

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'worker') {
      router.push('/worker/gigs');
      return;
    }

    try {
      const data = await getMyGigs(user.id, user.role);
      setGigs(data);
    } catch (err) {
      console.error('Failed to load posted gigs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigsData();
    const interval = setInterval(fetchGigsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleApplicants = async (gigId: string) => {
    if (expandedGigId === gigId) {
      setExpandedGigId(null);
      return;
    }

    setExpandedGigId(gigId);
    if (!applicationsMap[gigId]) {
      setAppsLoading(prev => ({ ...prev, [gigId]: true }));
      try {
        const apps = await getShiftApplications(gigId);
        setApplicationsMap(prev => ({ ...prev, [gigId]: apps }));
      } catch (e) {
        console.error(e);
      } finally {
        setAppsLoading(prev => ({ ...prev, [gigId]: false }));
      }
    }
  };

  const handleUpdateApplication = async (gigId: string, applicationId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
      // Reload applications for this gig
      const apps = await getShiftApplications(gigId);
      setApplicationsMap(prev => ({ ...prev, [gigId]: apps }));
      // Reload gigs list
      const user = await getMe();
      if (user) {
        const data = await getMyGigs(user.id, user.role);
        setGigs(data);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update application');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter tabs logic
  const openGigs = gigs.filter(g => g.status === 'published' || g.status === 'REQUESTED');
  const activeGigs = gigs.filter(g => g.status === 'filled' || g.status === 'in_progress' || g.status === 'ACCEPTED' || g.status === 'IN_PROGRESS');
  const completedGigs = gigs.filter(g => g.status === 'completed' || g.status === 'COMPLETED' || g.status === 'DECLINED' || g.status === 'cancelled');

  const filteredGigs = 
    activeTab === 'open' ? openGigs :
    activeTab === 'active' ? activeGigs :
    activeTab === 'completed' ? completedGigs :
    gigs;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-surface-border p-6 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full mb-1.5">
            <Briefcase size={13} /> Employer Control Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            My Posted Gigs & Shifts
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Manage your open listings, review applicant profiles, and monitor shift attendance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchGigsData}
            className="p-3 bg-white border border-surface-border hover:bg-stone-50 text-ink-muted hover:text-ink rounded-2xl transition-all shadow-sm"
            title="Refresh Gigs Data"
          >
            <RefreshCw size={16} />
          </button>
          <Link
            href="/post-gig"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white px-5 py-3 text-xs font-extrabold shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus size={16} />
            Post a New Gig
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-surface-border rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-ink-subtle uppercase tracking-wider">Total Gigs Posted</span>
          <p className="text-2xl font-black text-ink">{gigs.length}</p>
          <p className="text-[10px] text-brand-600 font-semibold">Across all categories</p>
        </div>

        <div className="bg-white border border-surface-border rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-ink-subtle uppercase tracking-wider">Seeking Staff (Open)</span>
          <p className="text-2xl font-black text-amber-600">{openGigs.length}</p>
          <p className="text-[10px] text-amber-700 font-semibold">Awaiting worker acceptance</p>
        </div>

        <div className="bg-white border border-surface-border rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-ink-subtle uppercase tracking-wider">Active Shifts</span>
          <p className="text-2xl font-black text-indigo-600">{activeGigs.length}</p>
          <p className="text-[10px] text-indigo-700 font-semibold">Confirmed or on-site now</p>
        </div>

        <div className="bg-white border border-surface-border rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-ink-subtle uppercase tracking-wider">Completed Gigs</span>
          <p className="text-2xl font-black text-emerald-600">{completedGigs.length}</p>
          <p className="text-[10px] text-emerald-700 font-semibold">Finished & verified</p>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-surface-border gap-2 sm:gap-6 overflow-x-auto pb-0.5">
        {[
          { id: 'all', label: 'All Posted Gigs', count: gigs.length },
          { id: 'open', label: 'Open (Seeking Staff)', count: openGigs.length },
          { id: 'active', label: 'Active / In-Progress', count: activeGigs.length },
          { id: 'completed', label: 'Completed', count: completedGigs.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-ink-subtle hover:text-ink-muted'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-brand-100 text-brand-800' : 'bg-stone-100 text-ink-subtle'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Gigs List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-white border border-surface-border rounded-3xl" />
          ))}
        </div>
      ) : filteredGigs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={
            activeTab === 'open' ? 'No open gigs seeking workers' :
            activeTab === 'active' ? 'No active shifts currently running' :
            activeTab === 'completed' ? 'No completed shifts in records' :
            'No posted gigs yet'
          }
          description="Create and publish shift requirements to start receiving worker applications from your local community."
          actionLabel="Post a New Gig"
          onAction={() => router.push('/post-gig')}
        />
      ) : (
        <div className="space-y-6">
          {filteredGigs.map((gig) => {
            const isExpanded = expandedGigId === gig.id;
            const applications = applicationsMap[gig.id] || [];
            const isAppsLoading = appsLoading[gig.id];
            const filledCount = gig.assignedWorkerIds?.length || gig.filledCount || 0;
            const requiredCount = gig.workersRequired || 1;
            const isFullyFilled = filledCount >= requiredCount;

            return (
              <div
                key={gig.id}
                className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm transition-all hover:shadow-md space-y-5"
              >
                {/* Card Top Row: Category, Urgency, Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      {gig.category}
                    </span>
                    {gig.urgency === 'urgent' && (
                      <span className="bg-rose-50 text-rose-700 border border-rose-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        ⚡ Urgent
                      </span>
                    )}
                    <span className="text-xxs font-semibold text-ink-subtle">
                      ID: #{gig.id.slice(-6)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Staffing Ratio Badge */}
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                      isFullyFilled 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      <Users size={13} />
                      {filledCount} of {requiredCount} spots filled
                    </span>
                    <StatusBadge status={gig.status} />
                  </div>
                </div>

                {/* Title & Scope */}
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-ink tracking-tight hover:text-brand-600 transition-colors">
                    <Link href={`/bookings/${gig.id}`}>
                      {gig.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
                    {gig.description}
                  </p>
                </div>

                {/* Metadata Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-ink font-semibold bg-stone-50/60 p-4 rounded-2xl border border-surface-border">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-ink-subtle uppercase tracking-wider font-bold block">Date</span>
                    <span className="flex items-center gap-1 text-ink-muted">
                      <Calendar size={13} className="text-brand-500" />
                      {gig.date}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-ink-subtle uppercase tracking-wider font-bold block">Timing</span>
                    <span className="flex items-center gap-1 text-ink-muted">
                      <Clock size={13} className="text-brand-500" />
                      {gig.time} ({gig.duration})
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-ink-subtle uppercase tracking-wider font-bold block">Location</span>
                    <span className="flex items-center gap-1 text-ink-muted truncate max-w-[150px]">
                      <MapPin size={13} className="text-brand-500 shrink-0" />
                      {gig.location}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-ink-subtle uppercase tracking-wider font-bold block">Payout per Person</span>
                    <span className="flex items-center gap-0.5 text-brand-700 font-extrabold text-sm">
                      <IndianRupee size={14} />
                      {gig.paymentAmount} ({gig.paymentType})
                    </span>
                  </div>
                </div>

                {/* Live Attendance Alerts if In-Progress or Completed */}
                {(gig.checkInTime || gig.checkOutTime) && (
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Radio size={14} className="text-emerald-600 animate-pulse" />
                      <span className="font-bold">Live Shift Attendance:</span>
                      {gig.checkInTime && <span>Checked in at {gig.checkInTime}</span>}
                      {gig.checkOutTime && <span>· Completed at {gig.checkOutTime}</span>}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      GPS Verified
                    </span>
                  </div>
                )}

                {/* Footer Controls: Review Applicants & Details */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleApplicants(gig.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 px-4 py-2 text-xs font-bold transition-all"
                    >
                      <UserCheck size={14} />
                      <span>Review Applicants</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/bookings/${gig.id}`}
                      className="rounded-xl border border-surface-border bg-white hover:bg-stone-50 text-ink px-4 py-2 text-xs font-bold transition-all shadow-xs"
                    >
                      View Shift Details →
                    </Link>
                  </div>
                </div>

                {/* Expandable Applicants Drawer */}
                {isExpanded && (
                  <div className="border-t border-surface-border pt-4 mt-2 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-ink flex items-center gap-1.5">
                        <Users size={14} className="text-brand-500" />
                        Worker Applicants for this Gig
                      </h4>
                      <span className="text-[10px] text-ink-muted font-medium">
                        {applications.length} total applicant{applications.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {isAppsLoading ? (
                      <div className="p-6 text-center text-xs font-semibold text-ink-subtle animate-pulse">
                        Loading applicants...
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-6 text-center text-xs text-ink-muted">
                        No pending applications yet. Nearby workers are being notified of this shift.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {applications.map((app) => (
                          <div
                            key={app.id}
                            className="bg-stone-50/70 border border-surface-border rounded-2xl p-4 space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200">
                                  {app.worker?.name ? app.worker.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'W'}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-ink flex items-center gap-1">
                                    {app.worker?.name || 'Worker'}
                                    {app.profile?.isVerified && (
                                      <span title="Verified Worker">
                                        <ShieldCheck size={13} className="text-emerald-500" />
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-ink-muted">
                                    {app.worker?.location || 'Local resident'} · Applied {new Date(app.appliedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                app.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                                app.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {app.status}
                              </span>
                            </div>

                            {/* Worker stats */}
                            <div className="flex items-center gap-3 text-[10px] text-ink-muted font-medium bg-white p-2 rounded-xl border border-surface-border">
                              <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                                <Star size={11} className="fill-amber-400 text-amber-400" />
                                {app.profile?.rating || 4.9}
                              </span>
                              <span>·</span>
                              <span>{app.profile?.reliabilityScore || 98}% Reliability</span>
                              <span>·</span>
                              <span>{app.profile?.completedGigsCount || 12} completed</span>
                            </div>

                            {/* Actions for Pending */}
                            {app.status === 'pending' && (
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => handleUpdateApplication(gig.id, app.id, 'accepted')}
                                  disabled={actionLoading === app.id}
                                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 disabled:opacity-50"
                                >
                                  <CheckCircle size={13} />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleUpdateApplication(gig.id, app.id, 'rejected')}
                                  disabled={actionLoading === app.id}
                                  className="rounded-xl border border-surface-border bg-white hover:bg-rose-50 text-rose-600 px-3 py-2 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                                >
                                  <XCircle size={13} />
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
