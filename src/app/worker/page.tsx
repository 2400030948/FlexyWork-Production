'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, IndianRupee, Star, CheckCircle, ShieldCheck, 
  MapPin, Bell, Radio, AlertCircle, RefreshCw 
} from 'lucide-react';
import { db } from '../../mock/data';
import { Gig, User } from '../../types';
import GigCard from '../../components/shared/GigCard';
import EarningsChart from '../../components/charts/EarningsChart';
import EmptyState from '../../components/ui/EmptyState';

export default function WorkerDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeGigs, setActiveGigs] = useState<Gig[]>([]);
  const [opportunities, setOpportunities] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkerDashboardData = () => {
    setLoading(true);
    const user = db.getCurrentUser();
    setCurrentUser(user);

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'worker') {
      router.push('/home');
      return;
    }

    const gigs = db.getGigs();

    // 1. Opportunities: Gigs with REQUESTED status and no assigned worker yet
    const opps = gigs.filter(g => g.status === 'REQUESTED' && g.assignedWorkerIds.length === 0);
    setOpportunities(opps);

    // 2. Active Gigs: Assigned to Priya Sharma
    const active = gigs.filter(
      g => g.assignedWorkerIds.includes(user.id) && g.status !== 'COMPLETED' && g.status !== 'DECLINED'
    );
    setActiveGigs(active);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkerDashboardData();
    const interval = setInterval(fetchWorkerDashboardData, 2000); // Polling for demo updates
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-surface-border p-6 rounded-2xl gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">
            Good morning, {currentUser?.name.split(' ')[0] || 'Priya'} 👋
          </h1>
          <p className="text-xs text-ink-muted mt-0.5 font-medium">Vijayawada Collective Member</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchWorkerDashboardData}
            className="p-2.5 bg-white border border-surface-border text-ink-muted hover:text-ink rounded-xl transition-all shadow-sm shrink-0"
            title="Refresh Data"
          >
            <RefreshCw size={15} />
          </button>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm shrink-0">
            <Radio size={14} className="text-emerald-500 animate-pulse" />
            Duty Live Matcher Active
          </div>
        </div>
      </div>

      {/* Statistics command grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="text-xxs font-extrabold uppercase tracking-wider">Earnings (Month)</span>
            <IndianRupee size={16} className="text-brand-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-ink">₹18,450</p>
          <p className="text-[10px] text-emerald-600 font-bold">↑ 12% vs last month</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="text-xxs font-extrabold uppercase tracking-wider">Completed Gigs</span>
            <CheckCircle size={16} className="text-indigo-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-ink">27</p>
          <p className="text-[10px] text-ink-subtle font-bold">14 cooperative pool gigs</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="text-xxs font-extrabold uppercase tracking-wider">Reliability Score</span>
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-ink">98%</p>
          <p className="text-[10px] text-emerald-600 font-bold">Top 5% of collective</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="text-xxs font-extrabold uppercase tracking-wider">Overall Rating</span>
            <Star size={16} className="fill-amber-400 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-ink">4.9★</p>
          <p className="text-[10px] text-ink-subtle font-bold">128 total reviews</p>
        </div>

      </div>

      {/* Middle Layout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (Gigs & Opportunities) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Gigs tracker */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-ink border-b border-surface-border pb-2">Active Gigs Tracker</h2>
            {loading ? (
              <div className="h-32 bg-white border rounded-2xl animate-pulse" />
            ) : activeGigs.length === 0 ? (
              <div className="bg-white border border-surface-border rounded-2xl p-6 text-center text-xs text-ink-muted italic">
                No gigs currently active. Browse and accept opportunities below.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {activeGigs.map(g => (
                  <GigCard 
                    key={g.id} 
                    gig={g} 
                    viewMode="worker" 
                    onActionComplete={fetchWorkerDashboardData} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* New Opportunities matches list */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-ink border-b border-surface-border pb-2">New Opportunities Around You</h2>
            {loading ? (
              <div className="h-32 bg-white border rounded-2xl animate-pulse" />
            ) : opportunities.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No gigs yet"
                description="New opportunities will appear here. Ensure your availability slots are up to date."
              />
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {opportunities.map(g => (
                  <GigCard 
                    key={g.id} 
                    gig={g} 
                    viewMode="worker" 
                    onActionComplete={fetchWorkerDashboardData} 
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right column (Earnings Analytics sidebar) */}
        <div className="space-y-6">
          <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="border-b border-surface-border pb-3">
              <h3 className="font-bold text-sm text-ink">Earnings Trends</h3>
              <p className="text-xxs text-ink-muted">Weekly comparison: Direct vs Cooperative pools</p>
            </div>
            
            <EarningsChart />

            <div className="flex gap-4 text-xxs font-bold text-ink-muted pt-2 border-t border-surface-border justify-around">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-brand-500" /> Personal shifts
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Cooperative pools
              </span>
            </div>
          </div>

          {/* Co-op Quick Access */}
          <div className="bg-brand-950 text-white rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_left,#6366f1,transparent_50%)]" />
            <h3 className="font-bold text-sm text-white">Vijayawada Collective Board</h3>
            <p className="text-[11px] text-brand-200 leading-normal">
              Secured a new facilities overhaul task. 4 worker spots are open. Join to secure your split.
            </p>
            <button
              onClick={() => router.push('/worker/communities')}
              className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-2 text-xs font-bold transition-all mt-2"
            >
              Browse Collective Gigs
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
