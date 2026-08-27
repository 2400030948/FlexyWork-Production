'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Shield, Users, Briefcase, IndianRupee, Star, 
  CheckCircle, ShieldCheck, ShieldAlert, Layers, Search, RefreshCw 
} from 'lucide-react';
import { db } from '../../mock/data';
import { User, WorkerProfile, Gig, Community } from '../../types';
import AdminCharts from '../../components/charts/AdminCharts';
import StatusBadge from '../../components/ui/StatusBadge';

interface AdminDashboardProps {
  initialTab?: 'overview' | 'users' | 'workers' | 'gigs' | 'communities' | 'reports';
}

export default function AdminDashboard({ initialTab = 'overview' }: AdminDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active tab state
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [success, setSuccess] = useState('');

  const loadAdminData = () => {
    setLoading(true);
    const user = db.getCurrentUser();
    
    // Auth Guard
    if (!user) {
      router.push('/login');
      return;
    }

    setUsers(db.getUsers());
    setWorkers(db.getWorkers());
    setGigs(db.getGigs());
    setCommunities(db.getCommunities());
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyWorker = (workerId: string) => {
    const allWorkers = db.getWorkers();
    const index = allWorkers.findIndex(w => w.id === workerId);
    if (index !== -1) {
      // Toggle verification status
      allWorkers[index].isVerified = !allWorkers[index].isVerified;
      db.updateWorkers(allWorkers);
      setWorkers(allWorkers);
      setSuccess(`Updated verification status for ${allWorkers[index].name}!`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Filter lists based on search
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGigs = gigs.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.employerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-surface-border p-6 rounded-2xl gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <Shield size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-ink tracking-tight">Admin Operations Console</h1>
            <p className="text-xs text-ink-muted mt-0.5 font-medium">Verify credentials, audit billing pools, and monitor platform logs.</p>
          </div>
        </div>
        <button
          onClick={loadAdminData}
          className="p-2.5 bg-white border border-surface-border text-ink-muted hover:text-ink rounded-xl transition-all shadow-sm shrink-0"
          title="Force System Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl p-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          {success}
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap border-b border-surface-border gap-x-6 gap-y-2">
        {([
          { id: 'overview', label: 'Platform KPIs' },
          { id: 'users', label: 'User Registry' },
          { id: 'workers', label: 'Worker Verification' },
          { id: 'gigs', label: 'Gig Audit Logs' },
          { id: 'communities', label: 'Collectives' },
          { id: 'reports', label: 'System Flags' }
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery('');
            }}
            className={`pb-3 text-xs font-extrabold border-b-2 transition-all uppercase tracking-wide ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-650'
                : 'border-transparent text-ink-subtle hover:text-ink-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE TAB */}
      {loading ? (
        <div className="h-64 bg-white border border-surface-border rounded-3xl animate-pulse flex items-center justify-center">
          <span className="text-xs font-semibold text-ink-subtle uppercase tracking-wider">Syncing Ledger...</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* KPIs Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-1">
                  <p className="text-xxs font-extrabold text-ink-muted uppercase tracking-wider">Total Users Registered</p>
                  <p className="text-xl sm:text-2xl font-black text-ink">4,500</p>
                  <p className="text-[10px] text-emerald-600 font-bold">↑ 8% growth this week</p>
                </div>
                <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-1">
                  <p className="text-xxs font-extrabold text-ink-muted uppercase tracking-wider">Active Gig Workers</p>
                  <p className="text-xl sm:text-2xl font-black text-ink">320</p>
                  <p className="text-[10px] text-ink-subtle font-bold">Vijayawada city limits</p>
                </div>
                <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-1">
                  <p className="text-xxs font-extrabold text-ink-muted uppercase tracking-wider">Total Gigs Completed</p>
                  <p className="text-xl sm:text-2xl font-black text-ink">828</p>
                  <p className="text-[10px] text-emerald-600 font-bold">98% fulfillment rate</p>
                </div>
                <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-1">
                  <p className="text-xxs font-extrabold text-ink-muted uppercase tracking-wider">Escrow Volume</p>
                  <p className="text-xl sm:text-2xl font-black text-ink">₹4,82,500</p>
                  <p className="text-[10px] text-ink-subtle font-bold">Platform commission: ₹48,250</p>
                </div>
              </div>

              {/* Chart & Logs columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Recharts panel */}
                <div className="lg:col-span-2 bg-white border border-surface-border rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-ink border-b border-surface-border pb-2">User Registry & Volume Growth</h3>
                  <AdminCharts />
                </div>

                {/* System Activity audit list */}
                <div className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-ink border-b border-surface-border pb-2">Live System Logs</h3>
                  <div className="space-y-4 text-xxs">
                    <div className="flex gap-2 items-start leading-normal">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                      <p className="text-ink-muted"><strong className="text-ink font-bold">[USER]</strong> Ramesh Babu registered as Seeker.</p>
                    </div>
                    <div className="flex gap-2 items-start leading-normal">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0 mt-1" />
                      <p className="text-ink-muted"><strong className="text-ink font-bold">[GIG]</strong> Seeker Harshita funded ₹800 escrow pool.</p>
                    </div>
                    <div className="flex gap-2 items-start leading-normal">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                      <p className="text-ink-muted"><strong className="text-ink font-bold">[COOP]</strong> Amit Patel joined Community Hall Maintenance.</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: USER REGISTRY */}
          {activeTab === 'users' && (
            <div className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm space-y-4">
              
              {/* Search box */}
              <div className="relative">
                <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-subtle" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user accounts by name or email..."
                  className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-10 py-2.5 text-xs text-ink font-medium"
                />
              </div>

              {/* Users table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-surface-border text-ink-subtle font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-4">User ID</th>
                      <th className="pb-3 px-4">Name</th>
                      <th className="pb-3 px-4">Email</th>
                      <th className="pb-3 pl-4 text-right">User Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border text-ink-muted font-medium">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3.5 pr-4 text-ink-subtle">{u.id}</td>
                        <td className="py-3.5 px-4 text-ink font-bold">{u.name}</td>
                        <td className="py-3.5 px-4 font-semibold">{u.email}</td>
                        <td className="py-3.5 pl-4 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin' 
                              ? 'bg-amber-50 text-amber-800' 
                              : u.role === 'worker'
                              ? 'bg-indigo-50 text-indigo-800'
                              : 'bg-stone-100 text-stone-850'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: WORKER VERIFICATION */}
          {activeTab === 'workers' && (
            <div className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-ink border-b border-surface-border pb-2">Verify Worker Credentials</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workers.map(w => (
                  <div key={w.id} className="flex justify-between items-center p-4 border border-surface-border rounded-2xl bg-stone-50/20">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-brand-50 border border-brand-100 text-brand-700 font-extrabold text-xs flex items-center justify-center rounded-lg">
                        {w.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink">{w.name}</p>
                        <p className="text-[9px] text-ink-muted mt-0.5">{w.skills[0]} · {w.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border tracking-wider ${
                        w.isVerified 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {w.isVerified ? 'Verified' : 'Pending Review'}
                      </span>
                      <button
                        onClick={() => handleVerifyWorker(w.id)}
                        className={`rounded-lg py-1.5 px-3 text-[10px] font-bold border transition-colors ${
                          w.isVerified 
                            ? 'border-rose-200 hover:bg-rose-50 text-rose-600 bg-white' 
                            : 'border-brand-500 bg-brand-500 hover:bg-brand-650 text-white'
                        }`}
                      >
                        {w.isVerified ? 'Revoke Verify' : 'Approve Verify'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GIGS AUDITING */}
          {activeTab === 'gigs' && (
            <div className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm space-y-4">
              
              {/* Search box */}
              <div className="relative">
                <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-subtle" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gigs by job title or seeker client name..."
                  className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-10 py-2.5 text-xs text-ink font-medium"
                />
              </div>

              {/* Gigs table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-surface-border text-ink-subtle font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-4">Title</th>
                      <th className="pb-3 px-4">Client</th>
                      <th className="pb-3 px-4">Pay</th>
                      <th className="pb-3 px-4">Date</th>
                      <th className="pb-3 pl-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border text-ink-muted font-medium">
                    {filteredGigs.map(g => (
                      <tr key={g.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3.5 pr-4 text-ink font-bold max-w-[200px] truncate">{g.title}</td>
                        <td className="py-3.5 px-4 font-semibold text-ink-subtle">{g.employerName}</td>
                        <td className="py-3.5 px-4 font-bold text-ink">₹{g.paymentAmount}</td>
                        <td className="py-3.5 px-4 font-semibold text-ink-subtle">{g.date}</td>
                        <td className="py-3.5 pl-4 text-right">
                          <StatusBadge status={g.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 5: COMMUNITIES */}
          {activeTab === 'communities' && (
            <div className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-ink border-b border-surface-border pb-2">Registered Worker Cooperatives</h3>
              
              <div className="divide-y divide-surface-border">
                {communities.map(c => (
                  <div key={c.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0 gap-4">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-xl shrink-0">
                        {c.logo}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-ink">{c.name}</h4>
                        <p className="text-[10px] text-ink-subtle font-semibold mt-0.5">
                          {c.memberCount} members · active in: {c.services.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-ink">₹{c.totalEarnings.toLocaleString('en-IN')}</p>
                      <p className="text-[9px] text-ink-subtle font-semibold uppercase tracking-wider">Pooled holdings</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SYSTEM FLAGS */}
          {activeTab === 'reports' && (
            <div className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm space-y-4 text-center py-12">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-base text-ink mt-4">Zero Disputes Logged</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed mt-1">
                All matched check-in check-out logs match within the target 500m radius threshold. No transaction payouts are held in dispute escrow.
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
