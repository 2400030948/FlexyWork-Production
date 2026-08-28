'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, RefreshCw, Star, MapPin, Search } from 'lucide-react';
import { Gig, User } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import GigCard from '../../components/shared/GigCard';
import EmptyState from '../../components/ui/EmptyState';
import { getMe } from '../../services/auth';
import { getMyGigs } from '../../services/gigs';

export default function BookingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed'>('upcoming');
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    const user = await getMe();
    setCurrentUser(user);

    if (!user) {
      router.push('/login');
      return;
    }

    const myGigs = await getMyGigs(user.id, user.role);
    setGigs(myGigs);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const upcomingGigs = gigs.filter(g => g.status === 'REQUESTED' || g.status === 'ACCEPTED');
  const activeGigs = gigs.filter(g => g.status === 'IN_PROGRESS');
  const completedGigs = gigs.filter(g => g.status === 'COMPLETED' || g.status === 'DECLINED');

  const getFilteredGigs = () => {
    if (activeTab === 'active') return activeGigs;
    if (activeTab === 'completed') return completedGigs;
    return upcomingGigs;
  };

  const currentTabGigs = getFilteredGigs();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Your Service Bookings & Posted Gigs</h1>
          <p className="text-xs text-ink-muted mt-0.5">Track matching status, applicant reviews, and active sessions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            className="p-2 text-ink-muted hover:text-ink bg-white border border-surface-border rounded-xl transition-all shadow-sm"
            title="Force Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
          <Link
            href="/post-gig"
            className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
          >
            + Post a Gig
          </Link>
          <Link
            href="/posted-gigs"
            className="rounded-xl border border-surface-border bg-white hover:bg-stone-50 text-ink px-3.5 py-2 text-xs font-bold transition-all shadow-sm"
          >
            Manage Applicants
          </Link>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-surface-border gap-6">
        {(['upcoming', 'active', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold border-b-2 transition-all capitalize ${
              activeTab === tab
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-ink-subtle hover:text-ink-muted'
            }`}
          >
            {tab} ({
              tab === 'upcoming' ? upcomingGigs.length :
              tab === 'active' ? activeGigs.length :
              completedGigs.length
            })
          </button>
        ))}
      </div>

      {/* Listing Panel */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-white border border-surface-border rounded-2xl" />
          ))}
        </div>
      ) : currentTabGigs.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={`No ${activeTab} bookings found`}
          description={
            activeTab === 'upcoming' 
              ? "You haven't requested any upcoming services. Find a local provider to get started."
              : activeTab === 'active'
              ? "No worker is currently checked in or working. Active sessions appear here."
              : "No historical gigs. Completed orders appear in this tab."
          }
          actionLabel={activeTab === 'upcoming' ? "Request a Service" : undefined}
          onAction={activeTab === 'upcoming' ? () => router.push('/explore') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {currentTabGigs.map(g => (
            <GigCard 
              key={g.id} 
              gig={g} 
              viewMode="seeker" 
              onActionComplete={fetchBookings} 
            />
          ))}
        </div>
      )}

    </div>
  );
}
