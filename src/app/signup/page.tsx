'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import { signup } from '../../services/auth';
import { UserRole } from '../../types';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('seeker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('Vijayawada');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signup(name, email, password, role, location);
      if (role === 'worker') {
        router.push('/worker');
      } else {
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-100/50 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-50/50 blur-3xl" />

      <div className="w-full max-w-lg space-y-6 bg-white border border-surface-border rounded-2xl p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-xl mb-4 shadow-md shadow-brand-500/20">
            F
          </span>
          <h2 className="text-2xl font-extrabold text-ink tracking-tight">Create your FLEXYWORK account</h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-brand-600 hover:text-brand-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-ink-muted">Choose your role</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('seeker')}
              className={`flex flex-col items-start p-4 border rounded-2xl text-left transition-all ${
                role === 'seeker'
                  ? 'border-brand-500 bg-brand-50/35 ring-2 ring-brand-500/10'
                  : 'border-surface-border bg-white hover:border-stone-300'
              }`}
            >
              <span className={`p-2 rounded-xl mb-3 shrink-0 ${
                role === 'seeker' ? 'bg-brand-500 text-white' : 'bg-stone-100 text-stone-600'
              }`}>
                <User size={18} />
              </span>
              <span className="font-bold text-sm text-ink">I need a Service</span>
              <span className="text-xxs text-ink-muted mt-1 leading-normal">
                Find nearby workers, view availability calendars, request gigs.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`flex flex-col items-start p-4 border rounded-2xl text-left transition-all ${
                role === 'worker'
                  ? 'border-brand-500 bg-brand-50/35 ring-2 ring-brand-500/10'
                  : 'border-surface-border bg-white hover:border-stone-300'
              }`}
            >
              <span className={`p-2 rounded-xl mb-3 shrink-0 ${
                role === 'worker' ? 'bg-indigo-500 text-white' : 'bg-stone-100 text-stone-600'
              }`}>
                <Briefcase size={18} />
              </span>
              <span className="font-bold text-sm text-ink">I want to Work</span>
              <span className="text-xxs text-ink-muted mt-1 leading-normal">
                Offer services, set pricing, join cooperative gig teams.
              </span>
            </button>
          </div>
        </div>

        {/* Details Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl p-3">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-ink-muted">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Babu"
              className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-ink-muted">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ramesh@gmail.com"
              className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-ink-muted">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-ink-muted">Your Location (City)</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Vijayawada, India"
              className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-3 text-sm font-bold shadow transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Register
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
