'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, Paintbrush, Wrench, Leaf, Users, Calendar, AlertCircle } from 'lucide-react';
import { WorkerProfile, Gig, User } from '../../types';
import ProviderCard from '../../components/shared/ProviderCard';
import GigCard from '../../components/shared/GigCard';
import { getMe } from '../../services/auth';
import { getMyGigs } from '../../services/gigs';
import { getProviders } from '../../services/providers';

export default function SeekerHome() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [providers, setProviders] = useState<WorkerProfile[]>([]);
  const [activeGigs, setActiveGigs] = useState<Gig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const loadHomeData = async () => {
      const user = await getMe();
      setCurrentUser(user);

      if (!user) {
        router.push('/login');
        return;
      }

      if (user.role === 'worker') {
        router.push('/worker');
        return;
      }

      const [providersData, gigsData] = await Promise.all([
        getProviders().catch(() => []),
        getMyGigs(user.id, user.role).catch(() => [])
      ]);
      setProviders(providersData);
      setActiveGigs(gigsData);
    };

    loadHomeData();
  }, [router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/explore?search=${encodeURIComponent(searchQuery)}`);
  };

  const categories = [
    { name: 'Cleaning', icon: Paintbrush, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { name: 'Repairs', icon: Wrench, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { name: 'Gardening', icon: Leaf, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { name: 'Cooperative Gigs', icon: Users, color: 'bg-sky-50 text-sky-600 border-sky-100' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-surface-border p-6 rounded-3xl gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">
            Good morning, {currentUser?.name.split(' ')[0] || 'Employer'}
          </h1>
          <p className="text-xs text-ink-muted mt-0.5 font-medium">{currentUser?.location || 'Indiranagar'}, India · Employer Portal</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/post-gig"
            className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all"
          >
            + Post a Gig
          </Link>
          <Link
            href="/posted-gigs"
            className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-700 hover:bg-brand-100 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Calendar size={14} className="text-brand-500" />
            My Posted Gigs
          </Link>
        </div>
      </div>

      {/* Large Search Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-ink">What do you need help with?</h2>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-subtle shrink-0" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Describe a task e.g., 'Need AC wiring installation tomorrow at Benz Circle'"
              className="w-full rounded-2xl border border-surface-border bg-white py-3.5 pl-12 pr-4 text-sm text-ink placeholder-ink-subtle font-medium focus:bg-white transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-brand-500 hover:bg-brand-600 text-white px-6 py-3.5 font-bold shadow-md shadow-brand-500/10 text-sm transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Categories Horizontal Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.name}
              href={c.name === 'Cooperative Gigs' ? '/community' : `/explore?category=${c.name}`}
              className="flex items-center gap-3 p-4 border border-surface-border bg-white rounded-2xl hover:border-brand-300 hover:shadow-sm transition-all group"
            >
              <span className={`p-2.5 rounded-xl shrink-0 border ${c.color} transition-transform group-hover:scale-105`}>
                <Icon size={18} />
              </span>
              <div>
                <p className="font-bold text-sm text-ink leading-tight">{c.name}</p>
                <p className="text-[10px] text-ink-subtle mt-0.5 font-semibold">Browse local listings</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Active Bookings Banner */}
      {activeGigs.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-surface-border pb-2">
            <h2 className="text-lg font-extrabold text-ink flex items-center gap-1.5">
              <Calendar size={18} className="text-brand-500" />
              Your Posted Gigs & Active Shifts
            </h2>
            <Link href="/posted-gigs" className="text-xs font-bold text-brand-600 hover:underline">
              View all ({activeGigs.length})
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeGigs.slice(0, 2).map((gig) => (
              <GigCard 
                key={gig.id} 
                gig={gig} 
                viewMode="seeker" 
                onActionComplete={() => {
                  if (currentUser) {
                    getMyGigs(currentUser.id, currentUser.role).then(setActiveGigs);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Nearby Workers Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-surface-border pb-2">
          <h2 className="text-lg font-extrabold text-ink">Skills Around You</h2>
          <Link href="/explore" className="text-xs font-bold text-brand-600 hover:underline">
            See all profiles
          </Link>
        </div>
        
        {providers.length === 0 ? (
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl p-6 text-sm text-stone-600">
            <AlertCircle size={18} className="shrink-0" />
            No workers located nearby. Change location scope to widen search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providers.slice(0, 3).map((w) => (
              <ProviderCard key={w.id} provider={w} />
            ))}
          </div>
        )}
      </div>

      {/* Startup Loop Banner */}
      <div className="bg-brand-950 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#6366f1,transparent_50%)]" />
        <div className="relative z-10 max-w-lg space-y-1">
          <h3 className="font-extrabold text-base">Earn more by partnering with your neighbors</h3>
          <p className="text-xs text-brand-200 font-medium">
            Join a local worker collective to bid on commercial contracts, pool tools, and share opportunities.
          </p>
        </div>
        <Link
          href="/signup"
          className="relative z-10 rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-colors shrink-0"
        >
          Become a Worker
        </Link>
      </div>

    </div>
  );
}
