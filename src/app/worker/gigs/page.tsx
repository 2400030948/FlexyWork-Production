'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Calendar, RefreshCw } from 'lucide-react';
import { Gig, User } from '../../../types';
import { getMyGigs } from '../../../services/gigs';
import GigCard from '../../../components/shared/GigCard';
import EmptyState from '../../../components/ui/EmptyState';
import { getMe } from '../../../services/auth';

export default function WorkerGigsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myGigs, setMyGigs] = useState<Gig[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [loading, setLoading] = useState(true);

  const fetchWorkerGigs = async () => {
    setLoading(true);
    const user = await getMe();
    setCurrentUser(user);

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const data = await getMyGigs(user.id, 'worker');
      setMyGigs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerGigs();
    const interval = setInterval(fetchWorkerGigs, 2000); // Polling MVP state updates
    return () => clearInterval(interval);
  }, [router]);

  const upcomingGigs = myGigs.filter(g => g.status !== 'COMPLETED' && g.status !== 'DECLINED');
  const completedGigs = myGigs.filter(g => g.status === 'COMPLETED' || g.status === 'DECLINED');

  const currentTabGigs = activeTab === 'upcoming' ? upcomingGigs : completedGigs;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Your Gig Schedules</h1>
          <p className="text-xs text-ink-muted mt-0.5">Manage confirmed shifts, submit attendance logs, and see job history.</p>
        </div>
        <button
          onClick={fetchWorkerGigs}
          className="p-2 text-ink-muted hover:text-ink bg-white border border-surface-border rounded-xl transition-all shadow-sm"
          title="Refresh Data"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-surface-border gap-6">
        {(['upcoming', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold border-b-2 transition-all capitalize ${
              activeTab === tab
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-ink-subtle hover:text-ink-muted'
            }`}
          >
            {tab === 'upcoming' ? 'Confirmed & Active' : 'Completed Gigs'} ({
              tab === 'upcoming' ? upcomingGigs.length : completedGigs.length
            })
          </button>
        ))}
      </div>

      {/* Listing Panel */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-white border rounded-2xl" />
        </div>
      ) : currentTabGigs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={`No ${activeTab} gigs confirmed`}
          description={
            activeTab === 'upcoming'
              ? "You haven't accepted any pending shifts. Go to your Command Center to view matching requests."
              : "No completed jobs. Finished shifts will log here along with your earnings."
          }
          actionLabel={activeTab === 'upcoming' ? "Find Opportunities" : undefined}
          onAction={activeTab === 'upcoming' ? () => router.push('/worker') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {currentTabGigs.map(g => (
            <GigCard 
              key={g.id} 
              gig={g} 
              viewMode="worker" 
              onActionComplete={fetchWorkerGigs} 
            />
          ))}
        </div>
      )}

    </div>
  );
}
