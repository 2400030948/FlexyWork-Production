'use client';

import React, { useEffect, useState } from 'react';
import { Crosshair, Loader2, MapPin, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { getCurrentPosition, describeGeoError, type GeoErrorCode } from '../../services/geo';
import { updateWorkerProfile } from '../../services/providers';
import { WorkerProfile } from '../../types';

interface WorkerLocationSectionProps {
  profile: WorkerProfile;
  onUpdated: (next: WorkerProfile) => void;
}

export default function WorkerLocationSection({ profile, onUpdated }: WorkerLocationSectionProps) {
  const [city, setCity] = useState<string>(profile.location || '');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    typeof profile.latitude === 'number' && typeof profile.longitude === 'number'
      ? { latitude: profile.latitude, longitude: profile.longitude }
      : null
  );
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ code: GeoErrorCode; message: string } | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setCity(profile.location || '');
    if (typeof profile.latitude === 'number' && typeof profile.longitude === 'number') {
      setCoords({ latitude: profile.latitude, longitude: profile.longitude });
    }
  }, [profile.location, profile.latitude, profile.longitude]);

  const handleDetect = async () => {
    setError(null);
    setSuccess('');
    setDetecting(true);
    const result = await getCurrentPosition();
    setDetecting(false);
    if (result.ok) {
      setCoords({ latitude: result.coords.latitude, longitude: result.coords.longitude });
      setSuccess('Coordinates detected. Save to apply them to your service location.');
    } else {
      setError({ code: result.code, message: result.message });
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess('');
    if (!city.trim()) {
      setError({ code: 'invalid', message: 'Please enter a city before saving.' });
      return;
    }
    setSaving(true);
    try {
      const payload: Parameters<typeof updateWorkerProfile>[0] = { location: city.trim() };
      if (coords) {
        payload.latitude = coords.latitude;
        payload.longitude = coords.longitude;
      }
      const updated = await updateWorkerProfile(payload);
      onUpdated(updated);
      setSuccess('Service location saved. Nearby seekers can now find you.');
    } catch (err: any) {
      setError({ code: 'unknown', message: err?.message || 'Could not save location.' });
    } finally {
      setSaving(false);
    }
  };
return (
    <section className="space-y-4">
      <div className="border-b border-surface-border pb-2">
        <h2 className="text-base font-bold text-ink flex items-center gap-1.5">
          <MapPin size={16} className="text-brand-600" />
          Service Location
        </h2>
        <p className="text-xs text-ink-muted">
          Set the city and approximate coordinates where you provide services so seekers nearby can find you.
          Only the city is shown to seekers — coordinates are used internally for matching.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-surface-border rounded-xl p-5 shadow-2xs space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-ink">Service City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Vijayawada"
              maxLength={120}
              className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink"
            />
            <p className="text-xxs text-ink-subtle">Public label shown on your profile and cards.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-ink">Coordinates (optional)</label>
            <button
              type="button"
              onClick={handleDetect}
              disabled={detecting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-surface-border bg-white hover:bg-stone-50 text-ink py-2 text-xs font-bold disabled:opacity-50"
            >
              {detecting ? (
                <Loader2 size={14} className="animate-spin shrink-0" />
              ) : (
                <Crosshair size={14} className="shrink-0" />
              )}
              {detecting
                ? 'Detecting…'
                : coords
                ? 'Update coordinates'
                : 'Use current location'}
            </button>
            <p className="text-xxs text-ink-subtle">
              {coords
                ? `Stored: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
                : 'No coordinates stored yet — seekers will only match by city.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xxs font-semibold text-amber-900">
            <AlertCircle size={12} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{describeGeoError(error.code) || error.message}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xxs font-semibold text-emerald-900">
            <CheckCircle size={12} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{success}</span>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving || !city.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 text-xs font-bold transition-all shadow-2xs btn-press disabled:opacity-50"
          >
            <Save size={13} />
            {saving ? 'Saving…' : 'Update Service Location'}
          </button>
        </div>
      </form>
    </section>
  );
}