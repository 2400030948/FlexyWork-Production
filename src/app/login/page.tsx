'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, ArrowRight, Shield, User, Loader2 } from 'lucide-react';
import { login } from '../../services/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123'); // seed mock password
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
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'seeker' | 'worker' | 'admin') => {
    setLoading(true);
    setError('');
    let demoEmail = 'harshita@flexywork.local';
    if (role === 'worker') demoEmail = 'worker@flexywork.local';
    if (role === 'admin') demoEmail = 'admin@flexywork.local';

    try {
      const user = await login(demoEmail, 'password123');
      if (user.role === 'worker') {
        router.push('/worker');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-100/50 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-50/50 blur-3xl" />

      <div className="w-full max-w-md space-y-8 bg-white border border-surface-border rounded-2xl p-8 shadow-sm">
        
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

        {/* Quick Demo Login panel */}
        <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 space-y-3">
          <p className="text-xxs font-extrabold uppercase tracking-wider text-brand-700 text-center">
            ⚡ Quick Demo Login (Skip Form Entry)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('seeker')}
              disabled={loading}
              className="flex flex-col items-center justify-center bg-white border border-brand-200 hover:border-brand-400 p-2.5 rounded-xl text-center text-xs font-semibold text-brand-800 transition-all hover:shadow-sm"
            >
              <User size={16} className="text-brand-500 mb-1" />
              Seeker
            </button>
            <button
              onClick={() => handleQuickLogin('worker')}
              disabled={loading}
              className="flex flex-col items-center justify-center bg-white border border-brand-200 hover:border-brand-400 p-2.5 rounded-xl text-center text-xs font-semibold text-brand-800 transition-all hover:shadow-sm"
            >
              <Briefcase size={16} className="text-indigo-500 mb-1" />
              Worker
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              className="flex flex-col items-center justify-center bg-white border border-brand-200 hover:border-brand-400 p-2.5 rounded-xl text-center text-xs font-semibold text-brand-800 transition-all hover:shadow-sm"
            >
              <Shield size={16} className="text-amber-500 mb-1" />
              Admin
            </button>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. seeker@flexywork.local"
              className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-3 text-sm font-bold shadow transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
