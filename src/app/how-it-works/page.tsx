import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle, ArrowRight, ShieldCheck, Star, Users, MapPin, 
  Layers, Clock, IndianRupee, Zap, HelpCircle 
} from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="bg-surface-soft min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <div className="mx-auto max-w-4xl text-center space-y-4 mb-16">
        <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full uppercase tracking-wider">
          How it works
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
          Cooperative local gig matching, demystified.
        </h1>
        <p className="text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
          FLEXYWORK isn't a directory website. It's a real-time local economy loop that pairs neighbors who need service with worker collectives who collaborate on jobs.
        </p>
      </div>

      {/* Seeker vs Worker Columns */}
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
        
        {/* Seeker Side */}
        <div className="bg-white border border-surface-border rounded-2xl p-8 space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-xl">
            S
          </div>
          <h2 className="text-xl font-extrabold text-ink">For Service Seekers</h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Need home deep cleaning, electrical wiring, or a garden overhaul? Skip bidding wars and direct-call skilled providers.
          </p>

          <ol className="space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-xs font-bold shrink-0">1</span>
              <div>
                <strong className="text-ink font-semibold">Search by Need or Prompt:</strong>
                <p className="text-ink-muted text-xs mt-0.5">Enter a raw description like "Need 2 cleaners tomorrow at 10 AM" and let our parsing matching engine fill it.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-xs font-bold shrink-0">2</span>
              <div>
                <strong className="text-ink font-semibold">Review Availability & Ratings:</strong>
                <p className="text-ink-muted text-xs mt-0.5">Browse verified provider profiles, live calendars, distance gauges, and authentic community credentials.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-xs font-bold shrink-0">3</span>
              <div>
                <strong className="text-ink font-semibold">Live GPS Attendance Tracking:</strong>
                <p className="text-ink-muted text-xs mt-0.5">Observe when your worker checks in at your location and checks out, verifying exact work hours automatically.</p>
              </div>
            </li>
          </ol>

          <div className="pt-4">
            <Link
              href="/explore"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-500 transition-colors"
            >
              Browse local professionals
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Worker Side */}
        <div className="bg-white border border-surface-border rounded-2xl p-8 space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl">
            W
          </div>
          <h2 className="text-xl font-extrabold text-ink">For Gig Workers</h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Gain complete scheduling independence. Set rates, define daily shifts, and collaborate in cooperatives to unlock bigger commercial opportunities.
          </p>

          <ol className="space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold shrink-0">1</span>
              <div>
                <strong className="text-ink font-semibold">Establish Availability Slots:</strong>
                <p className="text-ink-muted text-xs mt-0.5">Configure your availability hour-by-hour. Only receive matching gig alerts that correspond to your calendar.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold shrink-0">2</span>
              <div>
                <strong className="text-ink font-semibold">Accept or Decline Instantly:</strong>
                <p className="text-ink-muted text-xs mt-0.5">Review matched gig details, location range, and predicted payouts before taking a job.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold shrink-0">3</span>
              <div>
                <strong className="text-ink font-semibold">Collaborate on Co-op Jobs:</strong>
                <p className="text-ink-muted text-xs mt-0.5">Join forces with other cooperative members for complex multi-person projects (e.g. apartment garden overhaul) and share payouts equitably.</p>
              </div>
            </li>
          </ol>

          <div className="pt-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Sign up as a worker
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      {/* The Cooperative Model Panel */}
      <div className="mx-auto max-w-4xl bg-brand-950 text-white rounded-3xl p-8 sm:p-10 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#6366f1,transparent_50%)]" />
        
        <span className="inline-flex items-center gap-1 bg-brand-500/20 text-brand-300 px-3 py-1 rounded-full text-xs font-semibold border border-brand-500/30">
          <Users size={14} /> Cooperatives & Mutualism
        </span>

        <h2 className="text-2xl font-extrabold tracking-tight">The Core Difference: Why We Co-op</h2>
        <p className="text-sm text-brand-100/90 leading-relaxed">
          Standard gig apps treat workers as isolated, competing agents, leading to price wars and isolation. FLEXYWORK introduces local **Worker Collectives** to help professionals pool assets, share tools (like heavy equipment, lawn mowers), protect schedules via cover support, and collectively contract with larger commercial entities (e.g., apartment blocks).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div>
            <h4 className="font-bold text-sm text-white">Advanced Contracts</h4>
            <p className="text-xxs text-brand-200 mt-1 leading-normal">Co-ops bid on large-scale facilities management projects that a single worker could never fulfill alone.</p>
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Fair Payout Splits</h4>
            <p className="text-xxs text-brand-200 mt-1 leading-normal">Payout shares are agreed in advance based on role complexity and work-hour contribution, reducing arguments.</p>
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Collective Welfare</h4>
            <p className="text-xxs text-brand-200 mt-1 leading-normal">A portion of coop fees funds group health coverage, tool maintenance, and skills training workshops.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
