'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Star, Users, ArrowRight, CheckCircle, 
  MapPin, Clock, IndianRupee, Store, Coffee, Package, Wrench, Sparkles, Building2
} from 'lucide-react';

export default function LandingPage() {
  const categories = [
    { name: 'Cafes & Dining', role: 'Barista, Server, Kitchen Hand', icon: Coffee, count: '18 shifts today' },
    { name: 'Retail & Stores', role: 'Store Assistant, Cashier, Inventory', icon: Store, count: '24 shifts today' },
    { name: 'Warehousing & Logistics', role: 'Packing, Dispatch, Stocking', icon: Package, count: '15 shifts today' },
    { name: 'Events & Catering', role: 'Event Staff, Usher, Banquet Setup', icon: Users, count: '12 shifts today' },
    { name: 'Facility & Repairs', role: 'Maintenance, Setup, Cleaning', icon: Wrench, count: '9 shifts today' },
  ];

  return (
    <div className="relative bg-surface-soft min-h-screen text-ink">
      
      {/* Subtle background ambient line */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e7e5e433_1px,transparent_1px),linear-gradient(to_bottom,#e7e5e433_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Hero Section */}
      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Hero Narrative */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-surface-border px-3.5 py-1 text-xs font-semibold text-ink-muted shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Live local shifts in Bangalore & Vijayawada</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-ink leading-[1.08]">
              Work when you want. <br />
              <span className="text-brand-600">Hire when you need.</span>
            </h1>

            <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl font-normal">
              FlexWork connects local businesses with reliable independent workers for hourly, daily, recurring, and on-demand shifts with verified reliability ratings.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-6 py-3.5 font-bold shadow-sm shadow-brand-500/20 transition-all text-sm group"
              >
                Find Work & Earn
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link 
                href="/post-gig" 
                className="inline-flex items-center justify-center rounded-xl bg-white hover:bg-stone-50 text-ink px-6 py-3.5 font-semibold border border-surface-border transition-all text-sm shadow-2xs"
              >
                Post a Shift as Business
              </Link>
            </div>

            {/* Quick Proofline */}
            <div className="flex items-center gap-6 pt-4 text-xs font-medium text-ink-muted border-t border-surface-border">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={15} className="text-brand-600" />
                <span>Verified identity & skills</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={15} className="text-brand-600" />
                <span>Direct bank payout upon completion</span>
              </div>
            </div>
          </div>

          {/* Right Product Interaction Showcase */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xs">
                    <Store size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-ink">Third Wave Coffee Roasters</h3>
                    <p className="text-xxs text-ink-subtle">Indiranagar, 100ft Road</p>
                  </div>
                </div>
                <span className="text-xxs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                  Shift Today
                </span>
              </div>

              {/* Shift details */}
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <h4 className="text-sm font-bold text-ink">Counter & Service Assistant</h4>
                  <span className="text-sm font-black text-ink">₹850 <span className="text-xxs font-normal text-ink-subtle">/ shift</span></span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Assist counter service, manage order queue, and prep takeout packs during evening rush.
                </p>
                <div className="flex items-center gap-3 text-xs text-ink-subtle pt-1 font-medium">
                  <span className="flex items-center gap-1"><Clock size={13} /> 5:00 PM – 10:00 PM (5 hrs)</span>
                  <span className="flex items-center gap-1"><MapPin size={13} /> 1.2 km away</span>
                </div>
              </div>

              {/* Match Resolution Card */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      PS
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">Priya Sharma</p>
                      <p className="text-xxs text-emerald-800">42 completed shifts · ⭐ 4.9</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    96% Match
                  </span>
                </div>
                <p className="text-xxs text-emerald-800 leading-normal">
                  ✓ Available all shift · 1.2 km distance · Experienced with customer POS
                </p>
              </div>

              <div className="flex items-center justify-between text-xxs text-ink-subtle pt-1">
                <span>⚡ Average match time: <strong>14 minutes</strong></span>
                <span className="font-semibold text-brand-600">GPS Verified Check-in</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Popular Categories Grid */}
      <section className="bg-white border-t border-surface-border py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ink">Popular shift categories</h2>
              <p className="text-xs text-ink-muted mt-1">Hire verified hourly talent or find flexible daily gigs in your neighborhood.</p>
            </div>
            <Link href="/explore" className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
              View all available shifts <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.name}
                  href={`/explore?category=${encodeURIComponent(c.name)}`}
                  className="flex flex-col justify-between p-4 border border-surface-border rounded-xl bg-surface-soft hover:bg-white hover:border-brand-300 hover:shadow-2xs transition-all group"
                >
                  <div>
                    <div className="h-9 w-9 rounded-lg bg-white border border-surface-border text-ink flex items-center justify-center mb-3 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200 transition-colors">
                      <Icon size={18} />
                    </div>
                    <h3 className="font-bold text-xs text-ink group-hover:text-brand-600 transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-xxs text-ink-muted mt-1 line-clamp-1">{c.role}</p>
                  </div>
                  <span className="text-xxs font-semibold text-brand-600 mt-4 block">
                    {c.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How FlexWork Operates */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-2 mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-ink">How FlexWork works</h2>
            <p className="text-xs text-ink-muted">A streamlined workflow designed for local businesses and independent flexible workers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-surface-border rounded-xl p-5 space-y-2">
              <span className="text-xs font-black text-brand-600">01</span>
              <h3 className="font-bold text-sm text-ink">Describe or schedule</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Post a shift in plain words or use our structured creator. Set date, exact hours, tasks, and payout rate.
              </p>
            </div>

            <div className="bg-white border border-surface-border rounded-xl p-5 space-y-2">
              <span className="text-xs font-black text-brand-600">02</span>
              <h3 className="font-bold text-sm text-ink">Instant match & confirmation</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                FlexWork matches nearby workers based on availability, radius, and skills. Workers accept directly with one tap.
              </p>
            </div>

            <div className="bg-white border border-surface-border rounded-xl p-5 space-y-2">
              <span className="text-xs font-black text-brand-600">03</span>
              <h3 className="font-bold text-sm text-ink">Attendance & direct payout</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Workers check in and out on-site via secure OTP and GPS logs. Payouts are transferred automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-stone-900 text-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-5">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to staff your shift or earn flexible income?</h2>
          <p className="text-sm text-stone-300 max-w-lg mx-auto">
            Join thousands of businesses and local independent professionals working together across Indiranagar, Koramangala, and surrounding neighborhoods.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl px-6 py-3 text-xs font-bold transition-all shadow-sm"
            >
              Sign Up as Worker
            </Link>
            <Link
              href="/post-gig"
              className="inline-flex items-center justify-center bg-stone-800 hover:bg-stone-700 text-white rounded-xl px-6 py-3 text-xs font-semibold border border-stone-700 transition-all"
            >
              Post a Business Shift
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

