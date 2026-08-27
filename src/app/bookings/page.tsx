'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, RefreshCw, Star, MapPin, Search } from 'lucide-react';
import { db } from '../../mock/data';
import { Gig, User } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import GigCard from '../../components/shared/GigCard';
import EmptyState from '../../components/ui/EmptyState';

export default function BookingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed'>('upcoming');
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    const user = db.getCurrentUser();
    setCurrentUser(user);

    if (!user) {
      router.push('/login');
      return;
    }

    const myGigs = db.getGigs().filter(g => g.employerId === user.id);
    setGigs(myGigs);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 2000); // Polling for demo states
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Your Service Bookings</h1>
          <p className="text-xs text-ink-muted mt-0.5">Track matching status, active sessions, and payment histories.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-2 text-ink-muted hover:text-ink bg-white border border-surface-border rounded-xl transition-all shadow-sm"
          title="Force Refresh Data"
        >
          <RefreshCw size={16} />
        </button>
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
