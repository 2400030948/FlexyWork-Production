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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setSuccess('');
    try {
      await updateAvailability(profile.userId, availability);
      const updatedProfile = await updateWorkerProfile({ name, bio, hourlyRate: rate });
      setProfile({ ...updatedProfile, availability });
      setSuccess('Profile configuration and availability calendar saved successfully.');
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">Worker Profile Settings</h1>
        <p className="text-xs text-ink-muted mt-0.5">Customize your public bio, base hourly rates, and matching availability.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl p-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          {success}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Core Profile Card */}
        <div className="bg-white border border-surface-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-ink border-b border-surface-border pb-2">Biographical details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-ink-muted">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-ink-muted">Base Hourly Rate (₹/hr)</label>
              <input
                type="number"
                required
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink font-extrabold"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-ink-muted">Bio Description</label>
              <textarea
                rows={4}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-stone-50/50 px-4 py-2.5 text-sm text-ink leading-relaxed font-medium"
              />
            </div>
          </div>
        </div>

        {/* Availability Calendar Card */}
        <div className="bg-white border border-surface-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-surface-border pb-3">
            <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
              <Calendar size={16} className="text-brand-500" />
              Duty Availability Calendar
            </h3>
            <p className="text-xxs text-ink-muted mt-0.5">Toggle days on/off to control where matching prompts appear.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
            {availability.map((day) => (
              <button
                key={day.day}
                type="button"
                onClick={() => toggleDayStatus(day.day)}
                className={`flex flex-col items-center justify-between p-3 border rounded-xl text-center min-h-[92px] transition-all hover:border-brand-350 hover:shadow-sm ${
                  day.status === 'Available'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-stone-100 bg-stone-50 text-stone-400'
                }`}
              >
                <strong className="text-xs font-extrabold">{day.day}</strong>
                
                <div className="h-1.5 w-1.5 rounded-full my-2 bg-stone-300 transition-colors" />

                <span className={`text-[8px] font-extrabold uppercase tracking-wide ${
                  day.status === 'Available' ? 'text-emerald-700' : 'text-stone-400'
                }`}>
                  {day.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-6 py-3.5 text-xs font-bold transition-all shadow shadow-brand-500/10"
          >
            <Save size={16} />
            {loading ? 'Saving details...' : 'Save Configuration'}
          </button>
        </div>

      </form>

    </div>
  );
}
