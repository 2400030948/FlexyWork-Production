'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, ArrowRight, Shield, User, Loader2, KeyRound } from 'lucide-react';
import { login } from '../../services/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
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
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-100/50 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-50/50 blur-3xl" />

      <div className="w-full max-w-md space-y-6 bg-white border border-surface-border rounded-3xl p-8 shadow-sm">
        
        {/* Brand Header */}
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white font-black text-2xl mb-3 shadow-md shadow-brand-500/20">
            F
          </span>
          <h2 className="text-2xl font-extrabold text-ink tracking-tight">Sign in to FLEXYWORK</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Don't have an account?{' '}
            <Link href="/signup" className="font-bold text-brand-600 hover:text-brand-700 transition-colors">
              Create a free account
            </Link>
          </p>
        </div>

        {/* Quick Fill Shortcuts */}
        <div className="bg-stone-50 border border-surface-border rounded-2xl p-3.5 space-y-2 text-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-subtle flex items-center gap-1">
            <KeyRound size={12} className="text-brand-500" />
            Quick-Fill Your Saved Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleAutofill('soumya.mishra.7812@gmail.com', 'password123')}
              className="p-2 rounded-xl bg-white border border-surface-border hover:border-brand-300 text-left transition-all hover:shadow-xs group"
            >
              <p className="font-bold text-[11px] text-ink group-hover:text-brand-600">Soumya (Employer)</p>
              <p className="text-[9px] text-ink-muted truncate">soumya.mishra...gmail</p>
            </button>
            <button
              type="button"
              onClick={() => handleAutofill('soumyakittu.6.4.6@gmail.com', 'password123')}
              className="p-2 rounded-xl bg-white border border-surface-border hover:border-brand-300 text-left transition-all hover:shadow-xs group"
            >
              <p className="font-bold text-[11px] text-ink group-hover:text-brand-600">Soumya (Worker)</p>
              <p className="text-[9px] text-ink-muted truncate">soumyakittu...gmail</p>
            </button>
          </div>
        </div>

        {/* Login Form */}
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
              placeholder="e.g. soumya.mishra.7812@gmail.com"
              className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-xs font-bold text-ink focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-muted">Password</label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-xs font-bold text-ink focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-3 text-xs font-extrabold shadow-md shadow-brand-500/15 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
