'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, Briefcase, Calendar, Clock, MapPin, IndianRupee, 
  Users, CheckCircle, ArrowRight, AlertCircle, Plus, X, Zap, Eye, HelpCircle
} from 'lucide-react';
import { createGig, parseShiftNaturalLanguage, parseAIPrompt } from '../../services/gigs';

const CATEGORIES = [
  { id: 'Cleaning', name: 'Cleaning', icon: '🧹', skills: ['Deep Cleaning', 'Sanitization', 'Floor Scrubbing', 'Window Cleaning'] },
  { id: 'Repairs', name: 'Repairs & Maintenance', icon: '🔧', skills: ['Wiring & Electrical', 'Plumbing', 'Appliance Fix', 'Carpentry'] },
  { id: 'Gardening', name: 'Gardening & Outdoor', icon: '🌿', skills: ['Lawn Mowing', 'Pruning & Hedging', 'Soil Prep', 'Plant Care'] },
  { id: 'Cafe', name: 'Cafe & Food Service', icon: '☕', skills: ['Table Service', 'Barista / Coffee', 'Kitchen Prep', 'Dishwashing', 'Cashier'] },
  { id: 'Retail', name: 'Retail & Store Helper', icon: '🛍️', skills: ['Inventory Stocking', 'Customer Greeting', 'Billing Support', 'Tagging'] },
  { id: 'Logistics', name: 'Delivery & Logistics', icon: '📦', skills: ['Package Sorting', 'Loading / Unloading', 'Local Delivery'] },
  { id: 'Events', name: 'Event Support', icon: '🎉', skills: ['Guest Check-in', 'Stage Setup', 'Catering Assistance', 'Crowd Guidance'] },
  { id: 'General', name: 'General Helper', icon: '🤝', skills: ['Heavy Lifting', 'Basic Communication', 'Errands', 'Organization'] }
];

const PRESET_PROMPTS = [
  'I need a waiter this Saturday from 6 PM to 11 PM. Pay is ₹1000 for the shift. Must have customer service experience.',
  'Need 1 cashier this Saturday from 9 AM to 3 PM. ₹150 per hour. Must know Excel.',
  'Need 1 deep cleaner for 3BHK flat on Sunday 9 AM to 2 PM paying ₹1500.',
  'Need 1 electrician for store wiring repairs today from 2 PM to 6 PM paying ₹1200.'
];

export default function PostGigPage() {
  const router = useRouter();

  // AI Prompt Bar
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [needsClarification, setNeedsClarification] = useState<string[]>([]);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cleaning');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Deep Cleaning']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [workersRequired, setWorkersRequired] = useState(1);
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('2:00 PM');
  const [duration, setDuration] = useState('4h');
  const [location, setLocation] = useState('Indiranagar, Bangalore');
  const [paymentType, setPaymentType] = useState<'fixed' | 'hourly'>('fixed');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>(800);
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedGigId, setSubmittedGigId] = useState<string | null>(null);

  // Handle AI Auto-Fill & Natural Language Extraction
  const handleAIParsing = async (promptToUse?: string) => {
    const text = promptToUse || aiPrompt;
    if (!text.trim()) return;

    setAiLoading(true);
    setError('');
    setAiSuccessMessage(null);
    try {
      const response = await parseShiftNaturalLanguage(text);
      const { parsedShift, needsClarification: clarifications } = response;
      
      setNeedsClarification(clarifications || []);

      if (parsedShift) {
        if (parsedShift.title) setTitle(parsedShift.title);
        if (parsedShift.description) setDescription(parsedShift.description);
        if (parsedShift.category) {
          const matchCat = CATEGORIES.find(
            c => c.id.toLowerCase() === parsedShift.category?.toLowerCase() ||
                 c.name.toLowerCase().includes(parsedShift.category?.toLowerCase() || '')
          );
          if (matchCat) setCategory(matchCat.id);
          else setCategory('General');
        }
        if (Array.isArray(parsedShift.requiredSkills) && parsedShift.requiredSkills.length > 0) {
          setRequiredSkills(parsedShift.requiredSkills);
        }
        if (parsedShift.workersRequired) setWorkersRequired(Number(parsedShift.workersRequired));
        if (parsedShift.date) setDate(parsedShift.date);
        if (parsedShift.startTime) setStartTime(parsedShift.startTime);
        if (parsedShift.endTime) setEndTime(parsedShift.endTime);
        if (parsedShift.duration) setDuration(parsedShift.duration);
        if (parsedShift.paymentAmount !== null && parsedShift.paymentAmount !== undefined) {
          setPaymentAmount(Number(parsedShift.paymentAmount));
        }
        if (parsedShift.paymentType) setPaymentType(parsedShift.paymentType);
        if (parsedShift.location) setLocation(parsedShift.location);
        if (parsedShift.urgency) setUrgency(parsedShift.urgency);

        if (clarifications && clarifications.length > 0) {
          setAiSuccessMessage(`Draft generated! Please review and fill in highlighted fields (${clarifications.join(', ')}).`);
        } else {
          setAiSuccessMessage('Shift details successfully extracted! Please review below and publish.');
        }
      }
    } catch (err: any) {
      console.error('AI parse error:', err);
      setError("AI couldn't understand the description. You can still create the shift manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSkill = (skill: string) => {
    if (!requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill]);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleCustomSkillAdd = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSkillInput.trim() && !requiredSkills.includes(newSkillInput.trim())) {
      setRequiredSkills([...requiredSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || title.length < 3) {
      setError('Please provide a clear job title (min. 3 characters).');
      return;
    }
    if (!description.trim() || description.length < 8) {
      setError('Please provide a detailed description of the tasks (min. 8 characters).');
      return;
    }
    if (!location.trim()) {
      setError('Please provide the gig work location.');
      return;
    }
    if (paymentAmount <= 0) {
      setError('Please enter a valid payout amount.');
      return;
    }

    setLoading(true);
    try {
      const created = await createGig({
        title,
        description,
        category,
        requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['General Helper'],
        workersRequired,
        date,
        startTime,
        endTime,
        duration,
        paymentType,
        paymentAmount,
        location,
        urgency
      });

      setSubmittedGigId(created.id);
    } catch (err: any) {
      setError(err.message || 'Failed to publish gig. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentCategoryData = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

  if (submittedGigId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-6 animate-in fade-in duration-300">
        <div className="h-16 w-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle size={36} />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Gig Published & Live
          </span>
          <h2 className="text-3xl font-extrabold text-ink tracking-tight">Your Gig is Now Live!</h2>
          <p className="text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
            We have published <strong>"{title}"</strong> to the FlexyWork worker network. Workers in your area will be matched and can accept or apply immediately.
          </p>
        </div>

        <div className="bg-white border border-surface-border rounded-2xl p-5 text-left max-w-md mx-auto space-y-2 text-xs">
          <div className="flex justify-between border-b border-surface-border pb-2">
            <span className="text-ink-muted">Staffing Required:</span>
            <span className="font-bold text-ink">{workersRequired} Worker{workersRequired > 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between border-b border-surface-border pb-2">
            <span className="text-ink-muted">Schedule:</span>
            <span className="font-bold text-ink">{date} · {startTime} - {endTime}</span>
          </div>
          <div className="flex justify-between border-b border-surface-border pb-2">
            <span className="text-ink-muted">Pay per worker:</span>
            <span className="font-bold text-brand-600">₹{paymentAmount} ({paymentType})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Location:</span>
            <span className="font-bold text-ink truncate max-w-[200px]">{location}</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <button
            onClick={() => router.push('/posted-gigs')}
            className="flex-1 rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-3.5 text-xs font-bold transition-all shadow-md shadow-brand-500/10 flex items-center justify-center gap-1.5"
          >
            Manage Posted Gigs
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => {
              setSubmittedGigId(null);
              setTitle('');
              setDescription('');
            }}
            className="rounded-xl border border-surface-border bg-white text-ink hover:bg-stone-50 px-5 py-3.5 text-xs font-bold transition-all"
          >
            Post Another Gig
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full mb-2">
            <Briefcase size={13} /> Employer Shift Management
          </div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Post a New Gig / Shift</h1>
          <p className="text-xs text-ink-muted mt-1">
            Publish shifts to hire verified local independent workers for flexible shifts, temporary assistance, or specialized tasks.
          </p>
        </div>
        <Link
          href="/posted-gigs"
          className="rounded-xl border border-surface-border bg-white hover:bg-stone-50 text-ink px-4 py-2.5 text-xs font-bold transition-all shadow-sm shrink-0"
        >
          View My Posted Gigs →
        </Link>
      </div>

      {/* AI Smart Autofill Bar */}
      <div className="rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-50/70 via-indigo-50/40 to-white p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-brand-700 font-extrabold text-sm">
          <Sparkles size={18} className="text-brand-500 animate-pulse" />
          <span>Smart AI Gig Creator</span>
          <span className="text-[10px] font-semibold bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full uppercase">Fast-Fill</span>
        </div>
        <p className="text-xs text-ink-muted">
          Type your requirement in plain English and let AI fill in all fields instantly:
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. Need 2 cafe helpers tomorrow 4pm to 9pm in Indiranagar paying ₹800"
            className="flex-grow rounded-2xl border border-brand-200 bg-white py-3 px-4 text-xs font-medium text-ink placeholder-ink-subtle shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAIParsing();
              }
            }}
          />
          <button
            type="button"
            onClick={() => handleAIParsing()}
            disabled={aiLoading || !aiPrompt.trim()}
            className="rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-5 py-3 text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5"
          >
            {aiLoading ? (
              <>
                <Sparkles size={14} className="animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Zap size={14} />
                Auto-Fill Form
              </>
            )}
          </button>
        </div>

        {/* Preset Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider mr-1">Quick Suggestions:</span>
          {PRESET_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setAiPrompt(prompt);
                handleAIParsing(prompt);
              }}
              className="text-[10px] font-medium bg-white hover:bg-brand-50 text-ink-muted hover:text-brand-700 border border-brand-100 rounded-full px-2.5 py-1 transition-all"
            >
              {prompt.split(' ').slice(0, 4).join(' ')}...
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl p-4 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6 bg-white border border-surface-border rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* Section 1: Category Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
              1. Choose Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    // Add default category skills
                    if (cat.skills[0] && !requiredSkills.includes(cat.skills[0])) {
                      setRequiredSkills([cat.skills[0]]);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col items-start gap-1 transition-all ${
                    category === cat.id
                      ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/10 text-brand-900 font-bold'
                      : 'border-surface-border bg-stone-50/30 hover:border-stone-300 text-ink-muted'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-xs font-bold leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Title & Urgency */}
          <div className="space-y-4 border-t border-surface-border pt-6">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                2. Job Title & Urgency
              </label>
              
              {/* Urgency Toggle */}
              <button
                type="button"
                onClick={() => setUrgency(urgency === 'normal' ? 'urgent' : 'normal')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  urgency === 'urgent'
                    ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                    : 'bg-stone-50 border-surface-border text-ink-subtle hover:text-ink'
                }`}
              >
                <Zap size={13} className={urgency === 'urgent' ? 'fill-rose-600 text-rose-600' : ''} />
                {urgency === 'urgent' ? 'Marked as Urgent Shift' : 'Standard Urgency'}
              </button>
            </div>

            <div className="space-y-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Afternoon Cafe Waiter & Cashier"
                className="w-full rounded-2xl border border-surface-border bg-stone-50/40 px-4 py-3 text-sm font-bold text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Section 3: Skills Required */}
          <div className="space-y-3 border-t border-surface-border pt-6">
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
              3. Required Skills & Competencies
            </label>
            
            {/* Category Preset Skill Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-ink-subtle font-semibold">Recommended for {category}:</span>
              <div className="flex flex-wrap gap-1.5">
                {currentCategoryData.skills.map((s) => {
                  const isSelected = requiredSkills.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => isSelected ? handleRemoveSkill(s) : handleAddSkill(s)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-white text-ink-muted border-surface-border hover:bg-stone-50'
                      }`}
                    >
                      {isSelected ? `✓ ${s}` : `+ ${s}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Skill Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={handleCustomSkillAdd}
                placeholder="Add custom skill tag..."
                className="flex-grow rounded-xl border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink"
              />
              <button
                type="button"
                onClick={handleCustomSkillAdd}
                className="rounded-xl border border-surface-border bg-white hover:bg-stone-50 px-3 py-2 text-xs font-bold text-ink transition-all"
              >
                Add Tag
              </button>
            </div>

            {/* Selected Skills Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {requiredSkills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 bg-brand-50 text-brand-800 border border-brand-200 px-2.5 py-1 rounded-lg text-xs font-bold"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-brand-500 hover:text-brand-700"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 4: Schedule, Date & Workers */}
          <div className="space-y-4 border-t border-surface-border pt-6">
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
              4. Staffing & Shift Schedule
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Workers Count */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-muted">Workers Needed</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setWorkersRequired(Math.max(1, workersRequired - 1))}
                    className="h-10 w-10 rounded-xl border border-surface-border bg-stone-50 hover:bg-stone-100 flex items-center justify-center font-bold text-base text-ink"
                  >
                    -
                  </button>
                  <span className="text-lg font-extrabold text-ink w-8 text-center">{workersRequired}</span>
                  <button
                    type="button"
                    onClick={() => setWorkersRequired(workersRequired + 1)}
                    className="h-10 w-10 rounded-xl border border-surface-border bg-stone-50 hover:bg-stone-100 flex items-center justify-center font-bold text-base text-ink"
                  >
                    +
                  </button>
                  <span className="text-xs text-ink-muted font-medium ml-2">
                    {workersRequired === 1 ? 'Individual shift' : 'Team / Multi-worker shift'}
                  </span>
                </div>
              </div>

              {/* Work Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-muted">Work Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-surface-border bg-stone-50/40 px-4 py-2.5 text-xs font-bold text-ink"
                />
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-muted">Start Time</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-surface-border bg-stone-50/40 px-4 py-2.5 text-xs font-bold text-ink"
                >
                  {['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-muted">End Time</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-surface-border bg-stone-50/40 px-4 py-2.5 text-xs font-bold text-ink"
                >
                  {['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Location */}
          <div className="space-y-3 border-t border-surface-border pt-6">
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
              5. Work Location
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. 100ft Road, Indiranagar, Bangalore"
                className="w-full rounded-2xl border border-surface-border bg-stone-50/40 pl-10 pr-4 py-3 text-xs font-bold text-ink focus:bg-white"
              />
            </div>
          </div>

          {/* Section 6: Compensation */}
          <div className="space-y-4 border-t border-surface-border pt-6">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                6. Compensation & Payout
              </label>
              
              <div className="flex gap-1 bg-stone-100 p-0.5 rounded-xl border border-surface-border">
                <button
                  type="button"
                  onClick={() => setPaymentType('fixed')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    paymentType === 'fixed' ? 'bg-white text-ink shadow-xs' : 'text-ink-subtle'
                  }`}
                >
                  Fixed Pay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('hourly')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    paymentType === 'hourly' ? 'bg-white text-ink shadow-xs' : 'text-ink-subtle'
                  }`}
                >
                  Hourly Rate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-muted">
                  {paymentType === 'fixed' ? 'Total Pay per Worker (₹)' : 'Hourly Rate (₹/hr)'}
                </label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full rounded-2xl border border-surface-border bg-stone-50/40 pl-10 pr-4 py-3 text-base font-black text-ink"
                  />
                </div>
              </div>

              {/* Total Budget Calculator */}
              <div className="bg-brand-50/60 border border-brand-100 rounded-2xl p-3.5 space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-brand-800">
                  <span>Total Estimated Outlay:</span>
                  <span className="text-sm font-extrabold text-brand-700">₹{paymentAmount * workersRequired}</span>
                </div>
                <p className="text-[10px] text-brand-600">
                  For {workersRequired} worker{workersRequired > 1 ? 's' : ''} · Platform fee & insurance included
                </p>
              </div>
            </div>
          </div>

          {/* Section 7: Description & Scope */}
          <div className="space-y-2 border-t border-surface-border pt-6">
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
              7. Detailed Duties & Instructions
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the tasks, tools provided, attire, and any specific expectations..."
              className="w-full rounded-2xl border border-surface-border bg-stone-50/40 p-4 text-xs font-medium text-ink focus:bg-white"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-surface-border">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-500 hover:bg-brand-600 text-white py-4 text-sm font-extrabold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Publishing Gig...</span>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Publish Gig to Workers</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={14} className="text-brand-500" />
                Live Employee / Worker Preview
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Live Feed Preview
              </span>
            </div>

            {/* Mock Card Preview */}
            <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-md space-y-4">
              
              {/* Category & Status */}
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {category}
                </span>
                <div className="flex items-center gap-2">
                  {urgency === 'urgent' && (
                    <span className="bg-rose-50 text-rose-700 border border-rose-100 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                      Urgent
                    </span>
                  )}
                  <span className="text-xxs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase">
                    Open
                  </span>
                </div>
              </div>

              {/* Title & Desc */}
              <div>
                <h4 className="font-extrabold text-ink text-base">
                  {title || 'Afternoon Service Shift'}
                </h4>
                <p className="text-xs text-ink-muted line-clamp-3 mt-1 leading-relaxed">
                  {description || 'Provide flexible assistance during the shift as detailed in the scope.'}
                </p>
              </div>

              {/* Skills Chips */}
              <div className="flex flex-wrap gap-1">
                {requiredSkills.slice(0, 3).map(s => (
                  <span key={s} className="text-[10px] font-semibold bg-stone-100 text-ink-muted px-2 py-0.5 rounded-md">
                    {s}
                  </span>
                ))}
                {requiredSkills.length > 3 && (
                  <span className="text-[10px] font-semibold bg-stone-100 text-ink-muted px-1.5 py-0.5 rounded-md">
                    +{requiredSkills.length - 3} more
                  </span>
                )}
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted font-medium border-t border-surface-border pt-3">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-ink-subtle shrink-0" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-ink-subtle shrink-0" />
                  <span>{startTime} - {endTime}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <MapPin size={13} className="text-ink-subtle shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Users size={13} className="text-ink-subtle shrink-0" />
                  <span>{workersRequired} Spot{workersRequired > 1 ? 's' : ''} Available</span>
                </div>
              </div>

              {/* Footer Payout & Worker CTA Preview */}
              <div className="flex items-center justify-between border-t border-surface-border pt-4">
                <div>
                  <p className="text-xl font-black text-ink flex items-center gap-0.5">
                    <IndianRupee size={16} className="text-ink-muted" />
                    {paymentAmount}
                  </p>
                  <p className="text-[10px] text-ink-subtle font-medium uppercase tracking-wider">
                    {paymentType === 'fixed' ? 'Fixed Payout' : 'Hourly Rate'}
                  </p>
                </div>
                <span className="rounded-xl bg-brand-500 text-white px-4 py-2 text-xs font-bold shadow-sm">
                  Accept Gig
                </span>
              </div>

            </div>

            {/* Help Card */}
            <div className="bg-stone-50 border border-surface-border rounded-2xl p-4 text-xs space-y-1.5 text-ink-muted">
              <p className="font-bold text-ink">💡 How Gig Matching Works:</p>
              <p className="leading-relaxed">
                Once published, nearby workers receive instantaneous notifications. You will receive an alert as workers apply or accept, and you can approve them directly from your dashboard.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

