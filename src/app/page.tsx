'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, ShieldCheck, Star, Users, ArrowRight, Zap, 
  Paintbrush, Wrench, Leaf, Shield, CheckCircle, Handshake, Heart 
} from 'lucide-react';
import LocationBadge from '../components/ui/LocationBadge';

export default function LandingPage() {
  const router = useRouter();

  const categories = [
    { name: 'Cleaning', icon: Paintbrush, color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Repairs', icon: Wrench, color: 'bg-amber-50 text-amber-600' },
    { name: 'Gardening', icon: Leaf, color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Elder Care', icon: Heart, color: 'bg-rose-50 text-rose-600' },
    { name: 'Cooperative Gigs', icon: Users, color: 'bg-sky-50 text-sky-600' },
  ];

  return (
    <div className="relative overflow-hidden bg-surface-soft">
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Hero Section */}
      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles size={14} className="text-brand-500 animate-pulse" />
              Cooperative Gig Services Platform
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-[1.05]">
              Work flex. <br className="hidden sm:inline" />
              Earn more. <br className="hidden sm:inline" />
              <span className="text-brand-500">Grow together.</span>
            </h1>

            <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl">
              FLEXYWORK connects local communities with skilled people looking for flexible opportunities — making everyday services easier to find and cooperative work easier to access.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link 
                href="/post-gig" 
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-6 py-3.5 font-bold shadow-md shadow-brand-500/10 transition-all text-sm group"
              >
                Post a Gig as Employer
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center rounded-xl bg-white hover:bg-stone-50 text-ink px-6 py-3.5 font-bold border border-surface-border transition-all text-sm"
              >
                Find Gigs & Earn
              </Link>
            </div>
          </div>

          {/* Right Network Visualization Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full max-w-md mx-auto aspect-square bg-brand-50/30 rounded-3xl border border-brand-100/50 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
              
              {/* Network SVG Connections */}
              <svg className="absolute inset-0 h-full w-full stroke-brand-200/60 stroke-dashed" fill="none" viewBox="0 0 400 400">
                <path d="M 80,100 L 320,150" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 80,100 L 220,300" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 320,150 L 220,300" strokeWidth="2" strokeDasharray="4 4" />
              </svg>

              {/* Node 1: Cleaner */}
              <div className="absolute top-10 left-6 bg-white border border-surface-border rounded-2xl p-3.5 shadow-md flex items-center gap-3 animate-bounce-slow">
                <div className="h-9 w-9 rounded-xl bg-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow">PS</div>
                <div>
                  <h4 className="font-bold text-xs text-ink leading-none">Priya Sharma</h4>
                  <p className="text-[10px] text-brand-600 font-semibold mt-0.5">Deep Cleaning</p>
                  <LocationBadge location="Suryaraopeta" className="mt-1 !py-0 !px-1 text-[9px]" />
                </div>
              </div>

              {/* Node 2: Electrician */}
              <div className="absolute top-36 right-6 bg-white border border-surface-border rounded-2xl p-3.5 shadow-md flex items-center gap-3 animate-bounce-slow delay-75">
                <div className="h-9 w-9 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow">AP</div>
                <div>
                  <h4 className="font-bold text-xs text-ink leading-none">Amit Patel</h4>
                  <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Electrician</p>
                  <LocationBadge location="Benz Circle" className="mt-1 !py-0 !px-1 text-[9px]" />
                </div>
              </div>

              {/* Node 3: Gardener */}
              <div className="absolute bottom-10 left-20 bg-white border border-surface-border rounded-2xl p-3.5 shadow-md flex items-center gap-3 animate-bounce-slow delay-150">
                <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow">RK</div>
                <div>
                  <h4 className="font-bold text-xs text-ink leading-none">Ravi Kumar</h4>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Gardening Specialist</p>
                  <LocationBadge location="Governorpet" className="mt-1 !py-0 !px-1 text-[9px]" />
                </div>
              </div>

              {/* Core Hub Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white font-extrabold text-base shadow-lg shadow-brand-500/30 border-4 border-white animate-pulse">
                FLEXY
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Services Grid Section */}
      <section className="bg-white border-t border-surface-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">What needs doing?</h2>
            <p className="text-sm text-ink-muted">Explore popular local categories and find verified service professionals around you.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.name}
                  href={`/explore?category=${c.name}`}
                  className="flex flex-col items-center justify-center p-6 border border-surface-border rounded-2xl bg-surface-soft hover:bg-white hover:border-brand-300 hover:shadow-sm transition-all text-center group"
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${c.color}`}>
                    <Icon size={22} />
                  </div>
                  <span className="font-bold text-sm text-ink group-hover:text-brand-600 transition-colors">
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">How FLEXYWORK works</h2>
            <p className="text-sm text-ink-muted">Bridging the gap between active home service requests and collaborative worker teams.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative bg-white border border-surface-border rounded-2xl p-6 shadow-sm">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-4 bg-brand-50 text-brand-600 font-extrabold text-4xl p-2 rounded-xl border border-brand-100 select-none">
                01
              </div>
              <h3 className="font-bold text-lg text-ink mb-2">Find & Match</h3>
              <p className="text-sm text-ink-muted">
                Describe a service or use our smart prompt search. FlexyWork matches local independent gig professionals based on proximity and specific skills.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white border border-surface-border rounded-2xl p-6 shadow-sm">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-4 bg-brand-50 text-brand-600 font-extrabold text-4xl p-2 rounded-xl border border-brand-100 select-none">
                02
              </div>
              <h3 className="font-bold text-lg text-ink mb-2">Flex your Schedule</h3>
              <p className="text-sm text-ink-muted">
                Workers customize their hours day-by-day. Accept single on-demand gigs, request custom pricing splits, or join larger community contracts.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white border border-surface-border rounded-2xl p-6 shadow-sm">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-4 bg-brand-50 text-brand-600 font-extrabold text-4xl p-2 rounded-xl border border-brand-100 select-none">
                03
              </div>
              <h3 className="font-bold text-lg text-ink mb-2">Grow Together</h3>
              <p className="text-sm text-ink-muted">
                Execute tasks using direct GPS check-in logs. Get paid securely, build a reputation score, and pool earnings into cooperative community funds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cooperative Highlight Section */}
      <section className="bg-brand-950 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_left,#6366f1,transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Description */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex items-center gap-1 bg-brand-500/20 text-brand-300 px-3 py-1 rounded-full text-xs font-bold border border-brand-500/30">
                <Handshake size={14} /> The Cooperative Advantage
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Work doesn't have to be solo.</h2>
              <p className="text-brand-100/90 text-sm sm:text-base leading-relaxed">
                Join a community of skilled people, share opportunities, collaborate on larger jobs, and grow together. FlexyWork cooperatives bid on massive commercial estate contracts and divide payouts equitably based on skill contribution.
              </p>
              
              <ul className="space-y-3.5 text-sm font-semibold text-brand-200">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-brand-400 shrink-0" />
                  Shared tools & transport pooling
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-brand-400 shrink-0" />
                  Access to larger commercial estate contracts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-brand-400 shrink-0" />
                  Equity payout splits defined transparently in advance
                </li>
              </ul>
            </div>

            {/* Right Column Diagram */}
            <div className="lg:col-span-6 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <div className="border-b border-white/10 pb-4 mb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400">Cooperative Project Board</span>
                <h3 className="font-bold text-lg text-white">Community Hall Annual Maintenance</h3>
                <p className="text-xs text-brand-200 mt-1">Suryaraopeta Collective · Total Payout: ₹8,500</p>
              </div>

              <div className="space-y-4">
                {/* Electricians role */}
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5">
                  <div>
                    <p className="text-xs font-bold text-white">2 Electricians Required</p>
                    <p className="text-[10px] text-brand-300">Wiring & inspections</p>
                  </div>
                  <div className="flex -space-x-2">
                    <span className="h-6 w-6 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-[9px] border border-brand-950">AP</span>
                    <span className="h-6 w-6 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-[9px] border border-white/10 border-dashed">+</span>
                  </div>
                </div>

                {/* Gardener role */}
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5">
                  <div>
                    <p className="text-xs font-bold text-white">1 Gardener Required</p>
                    <p className="text-[10px] text-brand-300">Lawn Mowing & hedges</p>
                  </div>
                  <span className="h-6 w-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[9px] border border-brand-950">RK</span>
                </div>

                {/* Cleaner role */}
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5">
                  <div>
                    <p className="text-xs font-bold text-white">1 Deep Cleaner Required</p>
                    <p className="text-[10px] text-brand-300">Disinfection & scrub</p>
                  </div>
                  <span className="text-[10px] font-bold text-brand-300 bg-brand-500/20 px-2 py-1 rounded border border-brand-500/30">
                    Open Spot
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Link
                  href="/community"
                  className="inline-flex w-full justify-center items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-3 text-xs font-bold transition-all shadow shadow-brand-500/20"
                >
                  Browse Collective Gigs
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Metrics Section */}
      <section className="bg-white border-y border-surface-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Built on trust.</h2>
            <p className="text-sm text-ink-muted">A secure network built for independent local gig work.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Shield size={20} />
              </div>
              <h4 className="font-bold text-sm text-ink">Verified Profiles</h4>
              <p className="text-xs text-ink-muted mt-1 leading-normal">Identity checks & skills validation on sign up.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Star size={20} className="fill-brand-600" />
              </div>
              <h4 className="font-bold text-sm text-ink">Reliability Score</h4>
              <p className="text-xs text-ink-muted mt-1 leading-normal">GPS check-ins & completed rate calculated.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Zap size={20} />
              </div>
              <h4 className="font-bold text-sm text-ink">Transparent Payouts</h4>
              <p className="text-xs text-ink-muted mt-1 leading-normal">Direct bank transfers with clear platform fees.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Users size={20} />
              </div>
              <h4 className="font-bold text-sm text-ink">Cooperative Pools</h4>
              <p className="text-xs text-ink-muted mt-1 leading-normal">Pool resources & bid on massive local gigs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 text-center bg-surface-soft relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">Got a skill? Put it to work.</h2>
          <p className="text-base text-ink-muted max-w-md mx-auto">
            Set your own rates, work whenever you want, and build a trusted reputation score in your neighborhood.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-1 bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-7 py-3.5 font-bold shadow-md shadow-brand-500/10 transition-all text-sm group"
            >
              Start Earning Now
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
