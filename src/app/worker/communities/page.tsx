'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Handshake, ShieldCheck, IndianRupee, Star, 
  Layers, CheckCircle, RefreshCw, AlertCircle 
} from 'lucide-react';
import { db } from '../../mock/data';
import { Community, CooperativeGig, User } from '../../types';
import { getCommunities, getCoopGigs, joinCoopGig } from '../../services/communities';

export default function WorkerCommunitiesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [coopGigs, setCoopGigs] = useState<CooperativeGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchCommunitiesData = async () => {
    setLoading(true);
    setError('');
    const user = db.getCurrentUser();
    setCurrentUser(user);

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const comms = await getCommunities();
      setCommunities(comms);
      
      const gigs = await getCoopGigs();
      setCoopGigs(gigs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunitiesData();
    const interval = setInterval(fetchCommunitiesData, 2000); // Poll for live feed/coop updates
    return () => clearInterval(interval);
  }, [router]);

  const handleJoinCoop = async (gigId: string, skill: string) => {
    setSuccess('');
    setError('');
    try {
      const updated = await joinCoopGig(gigId, skill);
      setSuccess(`Successfully joined cooperative gig as "${skill}"! Check earnings trends.`);
      await fetchCommunitiesData();
    } catch (err: any) {
      setError(err.message || 'Failed to join cooperative gig.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Your Cooperatives & Gigs</h1>
          <p className="text-xs text-ink-muted mt-0.5">Bid on pooled commercial projects and share equipment resources.</p>
        </div>
        <button
          onClick={fetchCommunitiesData}
          className="p-2 text-ink-muted hover:text-ink bg-white border border-surface-border rounded-xl transition-all shadow-sm"
          title="Refresh Board"
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

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl p-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Cooperative Opportunities */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Active Cooperatives Opportunity list */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-ink flex items-center gap-1.5 border-b border-surface-border pb-2">
              <Handshake size={18} className="text-brand-500" />
              Collective Multi-Worker Gigs
            </h2>
            
            {loading && coopGigs.length === 0 ? (
              <div className="h-32 bg-white border rounded-2xl animate-pulse" />
            ) : coopGigs.length === 0 ? (
              <p className="text-xs text-ink-muted italic">No cooperative gigs available.</p>
            ) : (
              <div className="space-y-6">
                {coopGigs.map(cg => {
                  const community = communities.find(c => c.id === cg.communityId);
                  return (
                    <div key={cg.id} className="bg-white border border-surface-border rounded-3xl p-5 shadow-sm space-y-4">
                      
                      {/* Gig Metadata */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                            {community?.name || 'Local Cooperative'}
                          </span>
                          <h3 className="font-extrabold text-base text-ink mt-2 leading-tight">{cg.title}</h3>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-black text-ink">₹{cg.totalPayout}</p>
                          <p className="text-[9px] text-ink-subtle uppercase tracking-widest font-bold">Total Pool</p>
                        </div>
                      </div>

                      <p className="text-xs text-ink-muted leading-relaxed">
                        {cg.description}
                      </p>

                      {/* Required Skills & Joined Workers Status */}
                      <div className="space-y-3 pt-3 border-t border-surface-border">
                        <h4 className="text-[10px] uppercase font-bold text-ink-subtle tracking-wider">Required Squad Members</h4>
                        <div className="space-y-2">
                          {cg.skillsRequired.map(s => {
                            const isPriyaMatch = s.skill === 'Deep Cleaning' && currentUser?.id === 'user_priya';
                            const alreadyJoined = cg.joinedWorkers.some(w => w.id === currentUser?.id);
                            
                            return (
                              <div key={s.skill} className="flex justify-between items-center bg-stone-50 border border-stone-150 p-2.5 rounded-xl text-xs font-semibold">
                                <div>
                                  <p className="text-ink text-xs font-bold">{s.skill}</p>
                                  <p className="text-[9px] text-ink-subtle font-medium mt-0.5">
                                    {s.filled} of {s.count} positions filled
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {/* Avatars of filled */}
                                  <div className="flex -space-x-1.5">
                                    {cg.joinedWorkers.filter(w => w.role === s.skill).map(w => (
                                      <span 
                                        key={w.id} 
                                        className="h-6 w-6 rounded-full bg-brand-100 text-brand-700 font-bold border border-white flex items-center justify-center text-[9px] shadow-sm"
                                        title={`${w.name} as ${w.role}`}
                                      >
                                        {w.name.charAt(0)}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Join CTA if matches cleaner */}
                                  {s.filled < s.count && isPriyaMatch && !alreadyJoined && (
                                    <button
                                      onClick={() => handleJoinCoop(cg.id, s.skill)}
                                      className="rounded-lg bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-1.5 text-[10px] font-bold shadow-sm transition-all"
                                    >
                                      Join Squad
                                    </button>
                                  )}
                                  {s.filled === s.count && (
                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                      Filled
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Payout distribution rule */}
                      <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-3 text-[10px] text-brand-700 leading-normal flex items-start gap-2">
                        <Layers size={13} className="shrink-0 text-brand-500 mt-0.5" />
                        <div>
                          <strong className="font-extrabold uppercase tracking-wide">Payout Split Rule:</strong>
                          <p className="mt-0.5 font-medium">{cg.distribution}</p>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Collective members feeds */}
        <div className="space-y-6">
          
          {/* Active Collectives */}
          <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-ink border-b border-surface-border pb-2">Your Collectives</h3>
            <div className="space-y-4">
              {communities.map(c => (
                <div key={c.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-xl shrink-0">
                      {c.logo}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-ink leading-tight">{c.name}</h4>
                      <p className="text-[10px] text-ink-subtle font-semibold mt-0.5">
                        {c.memberCount} members · {c.rating}★ rating
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-ink-muted leading-relaxed italic">{c.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-ink border-b border-surface-border pb-2">Collective Activity Feed</h3>
            
            <div className="space-y-4">
              {communities.length > 0 && communities[0].activityFeed.map(act => (
                <div key={act.id} className="flex gap-2.5 items-start text-xxs leading-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0 mt-1" />
                  <div className="space-y-0.5">
                    <p className="text-ink font-semibold">{act.text}</p>
                    <span className="text-ink-subtle">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
