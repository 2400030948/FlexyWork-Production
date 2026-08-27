'use client';

import React, { useEffect, useState } from 'react';
import { getCommunities } from '../../services/communities';
import { Community } from '../../types';
import CommunityCard from '../../components/shared/CommunityCard';
import { Users, Info, Sparkles } from 'lucide-react';

export default function CommunitiesDirectory() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComms = async () => {
      setLoading(true);
      try {
        const data = await getCommunities();
        setCommunities(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchComms();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      
      {/* Directory Welcome Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1 bg-brand-50 border border-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold">
          <Sparkles size={13} className="text-brand-500 animate-pulse" />
          The FLEXYWORK Cooperative Model
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
          Skilled collectives, collaborating locally.
        </h1>
        <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
          Browse local worker-owned cooperatives. Cooperatives enable members to secure commercial facilities contracts, pool transport budgets, share heavy-duty tools, and establish fair pricing limits.
        </p>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="h-64 bg-white border border-surface-border rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communities.map(c => (
            <CommunityCard key={c.id} community={c} />
          ))}
        </div>
      )}

      {/* Dynamic Cooperative Explanation HUD */}
      <div className="bg-brand-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_left,#6366f1,transparent_50%)]" />
        
        <div className="relative z-10 space-y-2">
          <h3 className="font-extrabold text-lg text-white">How does a Worker Cooperative Gig work?</h3>
          <p className="text-xs text-brand-200 leading-relaxed max-w-2xl">
            When commercial clients publish heavy contracts (e.g. apartment facilities maintenance, office building disinfection), a local cooperative bids as a single provider. The cooperative software splits the contract payout equitably among the checked-in electricians, plumbers, and cleaners, depositing net payouts directly into their individual bank wallets.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs font-semibold text-brand-100">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-400 uppercase font-bold block">1. Cooperative Bidding</span>
            <p className="font-medium">Collectives negotiate standard rates directly with corporate real-estate developers.</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-brand-400 uppercase font-bold block">2. Squad Assembly</span>
            <p className="font-medium">Independent professionals join the contract squad depending on specific skills gaps.</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-brand-400 uppercase font-bold block">3. Escrow Dividends</span>
            <p className="font-medium">ESCROW payment splits are disbursed automatically when GPS attendance checkout completes.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
