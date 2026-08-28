'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Briefcase, ArrowRight, Loader2, Mail, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { signup, sendOtp, verifyOtp } from '../../services/auth';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { UserRole } from '../../types';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('seeker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('Vijayawada');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }
    setSendingOtp(true);
    setError('');
    setInfoMessage('');
    try {
      const res = await sendOtp(email);
      setOtpSent(true);
      setResendTimer(60);
      setInfoMessage(res.message || `Verification code sent to ${email}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setVerifyingOtp(true);
    setError('');
    try {
      const res = await verifyOtp(email, otp);
      setIsEmailVerified(true);
      setInfoMessage(res.message || 'Email verified successfully!');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isEmailVerified && !otp) {
      setError('Please verify your email address with the OTP code first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signup(name, email, password, role, location, otp);
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

        {/* Continue with Google */}
        <div className="space-y-3">
          <GoogleSignInButton
            role={role}
            text={`Sign up as ${role === 'worker' ? 'Worker' : 'Seeker'} with Google`}
            onError={(err) => setError(err)}
          />
          
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-stone-200" />
            <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Or register with email
            </span>
            <div className="w-full border-t border-stone-200" />
          </div>
        </div>

        {/* Details Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl p-3">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{infoMessage}</span>
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
              className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink focus:bg-white focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Email Address with OTP Trigger */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-ink-muted">Email address</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  disabled={isEmailVerified}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setOtpSent(false);
                    setIsEmailVerified(false);
                  }}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink disabled:bg-stone-100 disabled:text-stone-600 focus:bg-white focus:border-brand-500 focus:outline-none transition-colors"
                />
                {isEmailVerified && (
                  <CheckCircle2
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
                  />
                )}
              </div>

              {!isEmailVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || resendTimer > 0 || !email}
                  className="shrink-0 px-4 py-2.5 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {sendingOtp ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Mail size={14} />
                  )}
                  <span>
                    {resendTimer > 0 ? `Resend (${resendTimer}s)` : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* OTP Verification Box */}
          {otpSent && !isEmailVerified && (
            <div className="p-3.5 rounded-xl border border-brand-100 bg-brand-50/40 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-brand-600" />
                  Enter 6-Digit Email Code
                </label>
                <span className="text-[11px] text-brand-600">Valid for 10 mins</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 482910"
                  className="flex-1 rounded-lg border border-brand-200 bg-white px-3 py-2 text-center text-sm font-mono font-bold tracking-widest text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || otp.length < 4}
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {verifyingOtp ? <Loader2 size={14} className="animate-spin" /> : 'Verify Code'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-ink-muted">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password (min 6 chars)"
              className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink focus:bg-white focus:border-brand-500 focus:outline-none transition-colors"
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
              className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink focus:bg-white focus:border-brand-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-2">
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
                  Register as {role === 'worker' ? 'Worker' : 'Seeker'}
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
