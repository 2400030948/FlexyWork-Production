'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star, ShieldCheck, MessageSquare, ArrowLeft,
  Calendar, Check, ShieldAlert, BadgeCheck, Users
} from 'lucide-react';
import { getProviderById } from '../../../services/providers';
import { WorkerProfile } from '../../../types';
import AvailabilityBadge from '../../../components/ui/AvailabilityBadge';
import LocationBadge from '../../../components/ui/LocationBadge';

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const providerId = params.id as string;

  useEffect(() => {
    const fetchWorker = async () => {
      setLoading(true);
      try {
        const data = await getProviderById(providerId);
        setProvider(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (providerId) {
      fetchWorker();
    }
  }, [providerId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center animate-pulse">
        <div className="h-16 w-16 bg-stone-200 rounded-full mx-auto mb-4" />
        <div className="h-6 w-48 bg-stone-200 rounded mx-auto mb-2" />
        <div className="h-4 w-32 bg-stone-200 rounded mx-auto" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-lg font-bold text-ink">Provider profile not found</h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          The requested service professional does not exist or has unregistered from our system directory.
        </p>
        <button 
          onClick={() => router.push('/explore')}
          className="rounded-xl border border-surface-border bg-white text-ink px-4 py-2 text-xs font-bold shadow-sm"
        >
          Return to search
        </button>
      </div>
    );
  }

  // Mock Reviews
  const reviews = [
    { id: 1, author: 'Siddharth M.', rating: 5, date: '2 days ago', comment: `Extremely professional and on-time. ${provider.name.split(' ')[0]} handled the entire job with great care. Highly recommend!` },
    { id: 2, author: 'Kavitha R.', rating: 4.8, date: '1 week ago', comment: `Very thorough and detail-oriented. ${provider.name.split(' ')[0]} paid close attention to the small spots most people miss. Will book again.` }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Back link */}
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={14} /> Back to results
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white border border-surface-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 text-3xl font-extrabold flex items-center justify-center shadow-sm shrink-0">
              {provider.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-ink leading-none">{provider.name}</h1>
                {provider.isVerified && <BadgeCheck className="text-emerald-500 fill-emerald-50" size={20} />}
              </div>
              <p className="text-sm text-brand-600 font-bold">{provider.skills[0] || 'Household Helper'}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle">
                <span className="flex items-center gap-0.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <strong className="text-ink">{provider.rating.toFixed(1)}</strong> ({provider.completedGigsCount} gigs)
                </span>
                <span className="text-stone-300">•</span>
                <LocationBadge distance={provider.distance} location={provider.location} className="!py-0 !px-0 bg-transparent text-ink-muted" />
              </div>
            </div>
          </div>

          <div className="w-full sm:w-auto text-left sm:text-right shrink-0 border-t sm:border-t-0 border-surface-border pt-4 sm:pt-0">
            <p className="text-3xl font-extrabold text-ink">₹{provider.hourlyRate}</p>
            <p className="text-xxs font-bold text-ink-subtle uppercase tracking-wider">per hour rate</p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex flex-col sm:flex-row gap-3 border-t border-surface-border pt-6">
          <Link
            href={`/request-service?providerId=${provider.id}&skill=${encodeURIComponent(provider.skills[0] || '')}`}
            className="flex-1 inline-flex items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-3.5 text-sm font-bold shadow-md shadow-brand-500/10 transition-colors"
          >
            Request Service
          </Link>
          <button
            onClick={() => alert(`Simulated Chat with ${provider.name} initialized.`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-ink border border-surface-border px-6 py-3.5 text-sm font-bold transition-colors"
          >
            <MessageSquare size={16} />
            Message
          </button>
        </div>
      </div>

      {/* Detail Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side Details */}
        <div className="md:col-span-2 space-y-8">
          
          {/* About Section */}
          <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-ink">About {provider.name}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              {provider.bio}
            </p>
          </div>

          {/* Skills Tags */}
          <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-ink">Core Skills</h3>
            <div className="flex flex-wrap gap-2">
              {provider.skills.map(s => (
                <span key={s} className="bg-brand-50 text-brand-700 border border-brand-100 rounded-xl px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5">
                  <Check size={14} className="text-brand-500 shrink-0" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Availability Display */}
          <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-ink flex items-center gap-1.5">
              <Calendar size={18} className="text-brand-500" />
              Weekly Matching Availability
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
              {provider.availability.map((day) => (
                <div 
                  key={day.day} 
                  className={`flex flex-col items-center justify-between p-3 border rounded-xl text-center min-h-[92px] ${
                    day.status === 'Available'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : day.status === 'Limited'
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-stone-100 bg-stone-50 text-stone-400'
                  }`}
                >
                  <strong className="text-xs font-extrabold">{day.day}</strong>
                  <div className="space-y-0.5 my-1">
                    {day.ranges.slice(0, 2).map(r => (
                      <span key={r} className="block text-[8px] font-bold tracking-tight text-ink-muted bg-white border border-surface-border px-1 py-0.5 rounded leading-none shrink-0">
                        {r.replace(' PM', '').replace(' AM', '')}
                      </span>
                    ))}
                  </div>
                  <span className={`text-[8px] font-extrabold uppercase tracking-wide ${
                    day.status === 'Available'
                      ? 'text-emerald-700'
                      : day.status === 'Limited'
                      ? 'text-amber-700'
                      : 'text-stone-400'
                  }`}>
                    {day.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User Reviews */}
          <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-ink">Recent Reviews</h3>
            <div className="divide-y divide-surface-border space-y-4">
              {reviews.map(rev => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="text-ink">{rev.author}</strong>
                    <span className="text-ink-subtle">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={12} className={star <= Math.floor(rev.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'} />
                    ))}
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side Sidebar (Cooperative Membership) */}
        <div className="space-y-6">
          
          {/* Trust Panel card */}
          <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-ink border-b border-surface-border pb-2">Trust Metrics</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-muted">Reliability Rate</span>
                <strong className="text-ink font-bold">{provider.reliabilityScore}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Response Frequency</span>
                <strong className="text-emerald-600 font-bold">{provider.responseTime?.split(' ')[0] || 'Fast'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Identity Check</span>
                <strong className="text-emerald-600 font-bold flex items-center gap-0.5">
                  <ShieldCheck size={14} /> Passed
                </strong>
              </div>
            </div>
          </div>

          {/* Cooperative Membership panel */}
          {provider.communityName && (
            <div className="bg-brand-950 text-white rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_left,#6366f1,transparent_50%)]" />
              <div className="relative z-10">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400 flex items-center gap-1">
                  <Users size={12} /> Cooperative Member
                </span>
                <h3 className="font-bold text-sm text-white mt-1 leading-snug">{provider.communityName}</h3>
                <p className="text-[11px] text-brand-200 mt-2 leading-relaxed">
                  {provider.name.split(' ')[0]} is backed by a local collective. The collective provides shared tools, insurance cover, and replacement support if needed.
                </p>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Link 
                    href={`/community/${provider.communityId}`}
                    className="inline-flex w-full justify-center items-center gap-1 rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-2.5 text-xs font-bold transition-colors"
                  >
                    View Collective
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
