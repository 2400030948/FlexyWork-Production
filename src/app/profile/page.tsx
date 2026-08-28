'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, User, LogOut, ChevronRight, Award, ShieldCheck } from 'lucide-react';
import { User as UserType, WorkerProfile } from '../../types';
import { getMe, logout } from '../../services/auth';
import { getMyGigs } from '../../services/gigs';
import { getProviders } from '../../services/providers';

export default function SeekerProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [favorites, setFavorites] = useState<WorkerProfile[]>([]);
  const [stats, setStats] = useState({ upcoming: 0, completed: 0 });

  useEffect(() => {
    const loadProfile = async () => {
      const user = await getMe();
      setCurrentUser(user);

      if (!user) {
        router.push('/login');
        return;
      }

      const [gigs, workers] = await Promise.all([getMyGigs(user.id, user.role), getProviders()]);
      const upcoming = gigs.filter(g => g.status === 'REQUESTED' || g.status === 'ACCEPTED' || g.status === 'IN_PROGRESS').length;
      const completed = gigs.filter(g => g.status === 'COMPLETED').length;
      setStats({ upcoming, completed });
      setFavorites(workers.slice(0, 1));
    };

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">Your Seeker Profile</h1>
        <p className="text-xs text-ink-muted mt-0.5">Manage your details, favorite workers, and bookings history.</p>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-brand-100 text-brand-700 font-extrabold text-xl flex items-center justify-center rounded-2xl border border-brand-200 shadow-sm shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-ink leading-tight">{currentUser.name}</h2>
            <p className="text-xs text-ink-muted mt-0.5">{currentUser.email}</p>
            <span className="inline-flex items-center gap-0.5 bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px] font-bold mt-1">
              <MapPin size={10} />
              {currentUser.location || 'Vijayawada'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 px-4 py-2.5 text-xs font-bold transition-all shrink-0"
        >
          Logout Session
        </button>
      </div>

      {/* Seeker stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-surface-border rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-brand-600">{stats.upcoming}</p>
          <p className="text-[10px] text-ink-muted uppercase font-bold tracking-wider mt-1">Active / Pending Gigs</p>
        </div>
        <div className="bg-white border border-surface-border rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-emerald-600">{stats.completed}</p>
          <p className="text-[10px] text-ink-muted uppercase font-bold tracking-wider mt-1">Completed Services</p>
        </div>
      </div>

      {/* Favorite Workers Section */}
      <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-ink border-b border-surface-border pb-2">Preferred Workers</h3>
        
        {favorites.length === 0 ? (
          <p className="text-xs text-ink-muted">You haven't added any favorite helpers yet.</p>
        ) : (
          <div className="divide-y divide-surface-border">
            {favorites.map(f => (
              <div key={f.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-brand-50 border border-brand-100 text-brand-700 font-bold flex items-center justify-center rounded-lg text-xs">
                    {f.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <Link href={`/providers/${f.id}`} className="text-xs font-bold text-ink hover:text-brand-600 transition-colors">
                      {f.name}
                    </Link>
                    <p className="text-[10px] text-ink-muted mt-0.5">{f.skills[0]} · ₹{f.hourlyRate}/hr</p>
                  </div>
                </div>

                <Link
                  href={`/request-service?providerId=${f.id}&skill=${encodeURIComponent(f.skills[0] || '')}`}
                  className="rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-1.5 text-xs font-bold transition-all border border-brand-150 shrink-0"
                >
                  Book Again
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
