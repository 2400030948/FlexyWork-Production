'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronRight, ChevronLeft, Calendar, MapPin, IndianRupee, 
  Sparkles, CheckCircle, Clock, Check, Briefcase, FileText 
} from 'lucide-react';
import { getProviderById } from '../../services/providers';
import { createGig } from '../../services/gigs';
import { WorkerProfile } from '../../types';

function RequestServiceWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const providerIdParam = searchParams.get('providerId') || '';
  const skillParam = searchParams.get('skill') || '';

  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form States
  const [category, setCategory] = useState('Cleaning');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10)); // Default tomorrow
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('2:00 PM');
  const [location, setLocation] = useState('Vijayawada, India');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(800);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProvider = async () => {
      if (providerIdParam) {
        setLoading(true);
        const data = await getProviderById(providerIdParam);
        if (data) {
          setProvider(data);
          setCategory(data.skills[0]?.includes('Clean') ? 'Cleaning' : data.skills[0]?.includes('Repair') ? 'Repairs' : 'Gardening');
          setRequiredSkills([data.skills[0] || '']);
          // Set standard budget based on provider's hourly rate (approx 4 hours)
          setBudget(data.hourlyRate * 4);
        }
        setLoading(false);
      }
    };
    loadProvider();
  }, [providerIdParam]);

  const handleNext = () => {
    setError('');
    if (step === 1 && !category) {
      setError('Please select a service category.');
      return;
    }
    if (step === 2 && (!date || !startTime || !endTime)) {
      setError('Please fill in scheduling details.');
      return;
    }
    if (step === 3 && !location) {
      setError('Please enter a location.');
      return;
    }
    if (step === 4 && (!description || description.length < 8)) {
      setError('Please describe the task (minimum 8 characters).');
      return;
    }
    if (step === 4 && budget <= 0) {
      setError('Please enter a valid budget.');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleFormSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Calculate duration
      const duration = '4h'; // Mock duration

      await createGig({
        title: `${category} Service Request`,
        description,
        category,
        requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['General Helper'],
        workersRequired: 1,
        date,
        startTime,
        endTime,
        time: `${startTime} - ${endTime}`,
        duration,
        paymentType: 'fixed',
        paymentAmount: budget,
        location,
        urgency: 'normal'
      });

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit service request.');
    } finally {
      setLoading(false);
    }
  };

  // Render dynamic success view
  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-6 animate-in fade-in duration-300">
        <div className="h-16 w-16 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-ink tracking-tight">Request Sent.</h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            {provider 
              ? `${provider.name} has been notified. We'll let you know when she accepts.` 
              : 'Our matching system is notifying nearby workers. You will receive updates shortly.'}
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-2">
          <button
            onClick={() => router.push('/bookings')}
            className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-3.5 text-xs font-bold transition-all shadow shadow-brand-500/10"
          >
            Track Bookings
          </button>
          <button
            onClick={() => router.push('/home')}
            className="w-full rounded-xl border border-surface-border bg-white text-ink py-3.5 text-xs font-bold transition-all hover:bg-stone-50"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Wizard Header Progress */}
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">Request a Service</h1>
        
        {/* Step Progress indicators */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-ink-subtle">
          {[1, 2, 3, 4, 5].map((s) => (
            <React.Fragment key={s}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xxs transition-all ${
                s === step 
                  ? 'border-brand-500 bg-brand-50 text-brand-600 font-extrabold'
                  : s < step 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                  : 'border-surface-border bg-white'
              }`}>
                {s < step ? <Check size={12} /> : s}
              </span>
              {s < 5 && <span className="h-0.5 w-6 bg-stone-200" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl p-3">
          {error}
        </div>
      )}

      {/* Summary card for preselected provider */}
      {provider && (
        <div className="bg-brand-50/30 border border-brand-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-9 w-9 bg-brand-100 text-brand-700 font-extrabold text-xs flex items-center justify-center rounded-lg">
            {provider.name.split(' ').map(n => n[0]).join('').slice(0,2)}
          </div>
          <div>
            <p className="text-xs text-ink leading-none font-bold">Booking Request for {provider.name}</p>
            <p className="text-[10px] text-ink-muted mt-1">Rate: ₹{provider.hourlyRate}/hr · Verified Partner</p>
          </div>
        </div>
      )}

      {/* Step Panels */}
      <div className="bg-white border border-surface-border rounded-3xl p-6 sm:p-8 shadow-sm min-h-[300px] flex flex-col justify-between">
        
        <div className="space-y-6">
          
          {/* STEP 1: Select Service */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-ink flex items-center gap-1.5">
                <Briefcase size={18} className="text-brand-500" />
                Select Service Category
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Cleaning', 'Repairs', 'Gardening'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-4 border rounded-2xl text-left transition-all ${
                      category === cat
                        ? 'border-brand-500 bg-brand-50/35 ring-2 ring-brand-500/10'
                        : 'border-surface-border bg-white hover:border-stone-300'
                    }`}
                  >
                    <p className="font-bold text-sm text-ink">{cat}</p>
                    <p className="text-[10px] text-ink-muted mt-1 leading-normal">
                      Hire for {cat.toLowerCase()} shifts.
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-ink flex items-center gap-1.5">
                <Calendar size={18} className="text-brand-500" />
                Date and Schedule
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-muted">Work Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-muted">Start Time</label>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink font-medium"
                    >
                      {['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-muted">End Time</label>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink font-medium"
                    >
                      {['12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM', '10:00 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Location */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-ink flex items-center gap-1.5">
                <MapPin size={18} className="text-brand-500" />
                Work Location
              </h3>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-muted">Street Address / Neighborhood</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Benz Circle, Vijayawada"
                  className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink font-medium"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Description & Budget */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-ink flex items-center gap-1.5">
                <FileText size={18} className="text-brand-500" />
                Description & Budget
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-muted">Describe what needs doing</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Kitchen cleaning. Includes sweeps, grease cleaning on stove, washing 15 pots, sanitizing table surfaces..."
                    className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-muted">Offered Budget (₹)</label>
                  <div className="relative">
                    <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full rounded-xl border border-surface-border bg-stone-50/50 pl-10 pr-4 py-2.5 text-sm text-ink font-extrabold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Review */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-ink flex items-center gap-1.5">
                <Sparkles size={18} className="text-brand-500 animate-pulse" />
                Review Request Details
              </h3>
              
              <div className="border border-surface-border rounded-2xl p-4 bg-stone-50/30 space-y-3 text-sm">
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-ink-muted">Category</span>
                  <span className="font-bold text-brand-600 uppercase text-xs">{category}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-ink-muted">Schedule</span>
                  <span className="font-semibold text-ink">{date} at {startTime}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-ink-muted">Location</span>
                  <span className="font-semibold text-ink truncate max-w-[200px]">{location}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-ink-muted block text-xs">Description:</span>
                  <p className="text-xs text-ink bg-white border border-surface-border p-2.5 rounded-lg leading-relaxed italic">{description}</p>
                </div>
              </div>

              {/* Estimated Total Display */}
              <div className="flex justify-between items-center bg-brand-50 border border-brand-100 p-4 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-brand-700">Estimated Total</p>
                  <p className="text-[10px] text-brand-600 font-semibold uppercase tracking-wider">All taxes & platform insurance included</p>
                </div>
                <p className="text-2xl font-extrabold text-brand-700">₹{budget}</p>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Controls Footer */}
        <div className="flex gap-4 border-t border-surface-border pt-6 mt-6">
          {step > 1 && (
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-white text-ink px-4 py-2.5 text-xs font-bold transition-all hover:bg-stone-50"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-2.5 text-xs font-bold transition-all"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFormSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold transition-all shadow disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Send Request'}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}

export default function RequestServiceWizard() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-xs font-semibold text-ink-subtle uppercase tracking-wider">Loading request form...</div>}>
      <RequestServiceWizardContent />
    </Suspense>
  );
}
