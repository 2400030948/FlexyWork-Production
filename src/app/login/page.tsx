'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, ArrowRight, User, Loader2 } from 'lucide-react';
import { login } from '../../services/auth';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { UserRole } from '../../types';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('seeker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'worker') {
        router.push('/worker');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-100/50 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-50/50 blur-3xl" />

      <div className="w-full max-w-md space-y-6 bg-white border border-surface-border rounded-2xl p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-xl mb-4 shadow-md shadow-brand-500/20">
            F
          </span>
          <h2 className="text-2xl font-extrabold text-ink tracking-tight">Sign in to FLEXYWORK</h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            Or{' '}
            <Link href="/signup" className="font-bold text-brand-600 hover:text-brand-500 transition-colors">
              create a free account
            </Link>
          </p>
        </div>

        {/* Role Selection Tabs for Login */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ink-muted">Login as</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('seeker')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${
                role === 'seeker'
                  ? 'border-brand-500 bg-brand-50/60 text-brand-800 shadow-sm ring-1 ring-brand-500/20'
                  : 'border-surface-border bg-stone-50 text-stone-600 hover:bg-white'
              }`}
            >
              <User size={16} className={role === 'seeker' ? 'text-brand-600' : 'text-stone-400'} />
              <span>Seeker (Hire)</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${
                role === 'worker'
                  ? 'border-indigo-500 bg-indigo-50/60 text-indigo-800 shadow-sm ring-1 ring-indigo-500/20'
                  : 'border-surface-border bg-stone-50 text-stone-600 hover:bg-white'
              }`}
            >
              <Briefcase size={16} className={role === 'worker' ? 'text-indigo-600' : 'text-stone-400'} />
              <span>Worker (Work)</span>
            </button>
          </div>
        </div>

        {/* Continue with Google */}
        <div className="space-y-3">
          <GoogleSignInButton
            role={role}
            text={`Sign in as ${role === 'worker' ? 'Worker' : 'Seeker'} with Google`}
            onError={(err) => setError(err)}
          />
          
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-stone-200" />
            <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Or sign in with email
            </span>
            <div className="w-full border-t border-stone-200" />
          </div>
        </div>

        {/* Regular Login Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl p-3">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-ink-muted">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@gmail.com"
              className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink focus:bg-white focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-muted">Password</label>
              <span className="text-[10px] text-brand-600 font-bold hover:underline cursor-pointer">
                Forgot?
              </span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink focus:bg-white focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold text-white shadow transition-colors disabled:opacity-50 ${
              role === 'worker' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-brand-500 hover:bg-brand-600'
            }`}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                Sign In as {role === 'worker' ? 'Worker' : 'Seeker'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-stone-100 pt-4 text-center">
          <Link
            href="/admin/login"
            className="text-xs font-bold text-stone-500 transition-colors hover:text-ink"
          >
            Admin Login
          </Link>
        </div>

      </div>
    </div>
  );
}
