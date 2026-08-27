'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, Handshake, Star, ArrowLeft, Layers, 
  MapPin, Check, Sparkles, TrendingUp, UserCheck 
} from 'lucide-react';
import { db } from '../../mock/data';
import { Community, CooperativeGig } from '../../types';
import { getCommunityById, getCoopGigs } from '../../services/communities';

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(null);
  const [coopGigs, setCoopGigs] = useState<CooperativeGig[]>([]);
  const [loading, setLoading] = useState(true);

  const communityId = params.id as string;

  useEffect(() => {
    const loadCommunityData = async () => {
      setLoading(true);
      try {
        const data = await getCommunityById(communityId);
        setCommunity(data);
        if (data) {
          const gigs = await getCoopGigs(data.id);
          setCoopGigs(gigs);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (communityId) {
      loadCommunityData();
    }
  }, [communityId]);

  if (loading && !community) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center animate-pulse space-y-4">
        <div className="h-6 w-48 bg-stone-250 rounded mx-auto" />
        <div className="h-40 bg-stone-100 rounded-3xl" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-ink">Cooperative collective not found</h2>
        <Link href="/community" className="inline-block rounded-xl bg-brand-500 text-white px-4 py-2.5 text-xs font-bold shadow-sm">
          Return to Collectives
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Back button */}
      <Link href="/community" className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink transition-colors">
        <ArrowLeft size={14} /> Back to collectives
      </Link>

      {/* Main Banner Header Card */}
      <div className="bg-white border border-surface-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex items-center gap-4">
            <span className="h-16 w-16 bg-brand-50 border border-brand-100 flex items-center justify-center text-3xl rounded-2xl shadow-sm shrink-0">
              {community.logo}
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-ink tracking-tight leading-tight">{community.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle mt-1.5">
                <span className="flex items-center gap-0.5">
                  <Users size={13} />
                  <strong className="text-ink">{community.memberCount}</strong> active members
                </span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-0.5">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <strong className="text-ink">{community.rating.toFixed(1)}</strong> collective rating
                </span>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-auto text-left sm:text-right shrink-0 border-t sm:border-t-0 border-surface-border pt-4 sm:pt-0">
            <p className="text-3xl font-extrabold text-ink">₹{community.totalEarnings.toLocaleString('en-IN')}</p>
            <p className="text-xxs font-bold text-ink-subtle uppercase tracking-wider">Pooled collective earnings</p>
          </div>
        </div>
      </div>

      {/* Details Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: About & Cooperative Gig Opportunities Board */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About Collective */}
          <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-ink">Collective Mandate</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              {community.description}
            </p>
          </div>

          {/* Active Cooperative Gigs Board */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-ink border-b border-surface-border pb-2">Active Commercial Gigs Board</h3>
            {coopGigs.length === 0 ? (
              <div className="bg-white border border-surface-border rounded-2xl p-6 text-center text-xs text-ink-muted italic">
                No shared commercial contracts are currently active for this collective.
              </div>
            ) : (
              <div className="space-y-6">
                {coopGigs.map(cg => (
                  <div key={cg.id} className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-ink">{cg.title}</h4>
                        <p className="text-xxs text-ink-subtle mt-0.5">Status: <span className="font-bold text-brand-600 uppercase">{cg.status}</span></p>
                      </div>
                      <p className="text-base font-extrabold text-ink">₹{cg.totalPayout}</p>
                    </div>

                    <p className="text-xs text-ink-muted leading-relaxed">
                      {cg.description}
                    </p>

                    {/* Team Members Assembled */}
                    <div className="space-y-2.5 pt-3 border-t border-surface-border text-xs">
                      <p className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider">Assembled Squad</p>
                      <div className="space-y-1.5">
                        {cg.skillsRequired.map(s => (
                          <div key={s.skill} className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-ink-muted">{s.skill} ({s.filled}/{s.count})</span>
                            <div className="flex items-center gap-1">
                              {/* Show worker name of filled */}
                              <div className="flex items-center gap-1.5">
                                {cg.joinedWorkers.filter(w => w.role === s.skill).map(w => (
                                  <span key={w.id} className="text-[10px] text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-2.5 py-1 font-bold flex items-center gap-1">
                                    <UserCheck size={11} /> {w.name}
                                  </span>
                                ))}
                              </div>
                              {s.filled < s.count && (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 animate-pulse">
                                  Position Open
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-[10px] text-stone-600 leading-normal font-medium">
                      <strong>Payout split rules:</strong> {cg.distribution}
                    </div>

                    {cg.status === 'open' && (
                      <div className="pt-2 text-center">
                        <Link
                          href="/worker/communities"
                          className="inline-flex justify-center items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow shadow-brand-500/10 w-full"
                        >
                          Join Cooperative Squad
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Services & Activity Feeds */}
        <div className="space-y-6">
          
          {/* Services list */}
          <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-ink border-b border-surface-border pb-2">Active Services</h3>
            <div className="flex flex-wrap gap-1.5">
              {community.services.map(s => (
                <span key={s} className="bg-stone-50 text-stone-600 border border-stone-200 rounded px-2.5 py-1 text-[10px] font-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Activity feed list */}
          <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-ink border-b border-surface-border pb-2">Collective Activity Feed</h3>
            <div className="space-y-4">
              {community.activityFeed.map(act => (
                <div key={act.id} className="flex gap-2 items-start text-xxs leading-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0 mt-1" />
                  <div>
                    <p className="text-ink font-semibold">{act.text}</p>
                    <span className="text-ink-subtle mt-0.5 block">{act.timestamp}</span>
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
