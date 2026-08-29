'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Save, CheckCircle, ShieldCheck, User } from 'lucide-react';
import { WorkerProfile, AvailabilitySlot } from '../../../types';
import { getMe } from '../../../services/auth';
import { getProviderById, updateAvailability, updateWorkerProfile } from '../../../services/providers';

export default function WorkerProfileSettings() {
  const router = useRouter();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [rate, setRate] = useState(200);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const user = await getMe();
      if (!user || user.role !== 'worker') {
        router.push('/login');
        return;
      }

      const wProfile = await getProviderById(user.id);
      if (wProfile) {
        setProfile(wProfile);
        setAvailability(wProfile.availability);
        setName(wProfile.name);
        setPhone(wProfile.phone || user.phone || '+91 98765 43210');
        setBio(wProfile.bio);
        setRate(wProfile.hourlyRate);
      }
    };

    loadProfile();
  }, [router]);

  const toggleDayStatus = (dayName: string) => {
    setAvailability(prev => 
      prev.map(slot => {
        if (slot.day === dayName) {
          const nextStatus = slot.status === 'Available' ? 'Unavailable' : 'Available';
          return {
            ...slot,
            status: nextStatus,
            ranges: nextStatus === 'Available' ? ['9 AM - 5 PM'] : []
          };
        }
        return slot;
      })
    );
  };

  const updateTimeRange = (dayName: string, range: string) => {
    setAvailability(prev =>
      prev.map(slot => {
        if (slot.day === dayName) {
          return {
            ...slot,
            status: 'Available',
            ranges: [range]
          };
        }
        return slot;
      })
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setSuccess('');
    try {
      await updateAvailability(profile.userId, availability);
      const updatedProfile = await updateWorkerProfile({ name, phone, bio, hourlyRate: rate });
      setProfile({ ...updatedProfile, availability });
      setSuccess('Profile configuration and weekly schedule saved successfully.');
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 page-enter">
      
      {/* Title & Human Profile Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-border pb-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xl border border-brand-200/80 shadow-2xs shrink-0">
            {name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'W'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-ink tracking-tight">{name || 'Worker Profile'}</h1>
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              ⭐ 4.9 · 96% Reliability · Indiranagar, Bangalore
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-2xs btn-press disabled:opacity-50"
        >
          <Save size={14} />
          {loading ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl p-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          {success}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* SECTION 1: WEEKLY AVAILABILITY SCHEDULE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-2">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-1.5">
                <Calendar size={16} className="text-brand-600" />
                Weekly Shift Availability
              </h2>
              <p className="text-xs text-ink-muted">Set the hours you are available for work across Monday to Sunday</p>
            </div>
            <span className="text-xxs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              ● Match Active
            </span>
          </div>

          <div className="bg-white border border-surface-border rounded-xl divide-y divide-surface-border shadow-2xs overflow-hidden">
            {availability.map((day) => {
              const isAvail = day.status === 'Available';
              const currentRange = day.ranges?.[0] || '5 PM - 10 PM';

              return (
                <div key={day.day} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-[120px]">
                    <button
                      type="button"
                      onClick={() => toggleDayStatus(day.day)}
                      className={`h-5 w-9 rounded-full transition-colors relative flex items-center p-0.5 ${
                        isAvail ? 'bg-emerald-500' : 'bg-stone-300'
                      }`}
                    >
                      <span className={`h-4 w-4 rounded-full bg-white transition-transform ${
                        isAvail ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                    <span className="text-xs font-bold text-ink">{day.day}</span>
                  </div>

                  {isAvail ? (
                    <div className="flex flex-wrap items-center gap-2 flex-grow justify-start sm:justify-end">
                      {['9 AM - 2 PM', '5 PM - 10 PM', '6 PM - 11 PM', 'Full Day (9 AM - 6 PM)'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => updateTimeRange(day.day, preset)}
                          className={`text-xxs font-semibold px-2.5 py-1 rounded-md border transition-all ${
                            currentRange === preset
                              ? 'bg-brand-50 border-brand-300 text-brand-800 font-bold'
                              : 'bg-white border-surface-border text-ink-muted hover:bg-stone-100'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-ink-subtle italic">Unavailable</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: BIOGRAPHICAL & PROFILE SETTINGS */}
        <div className="space-y-4">
          <div className="border-b border-surface-border pb-2">
            <h2 className="text-base font-bold text-ink">Personal & Service Details</h2>
            <p className="text-xs text-ink-muted">Public worker profile visible to employers in Indiranagar</p>
          </div>

          <div className="bg-white border border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Contact Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-bold text-ink"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-ink">Base Hourly Rate (₹ / hr)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    required
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-32 rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-bold text-ink"
                  />
                  <span className="text-xxs text-ink-subtle">
                    Recommended rate in Bangalore for general services: ₹180 – ₹250 / hr
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-ink">Professional Bio & Experience Summary</label>
                <textarea
                  rows={3}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 p-3 text-xs leading-relaxed font-medium text-ink"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 text-xs font-bold transition-all shadow-2xs btn-press disabled:opacity-50"
          >
            <Save size={14} />
            {loading ? 'Saving details...' : 'Save Configuration'}
          </button>
        </div>

      </form>

    </div>
  );
}

