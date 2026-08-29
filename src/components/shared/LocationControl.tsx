'use client';

import React, { useEffect, useState } from 'react';
import { Crosshair, Loader2, MapPin, AlertCircle, ChevronDown } from 'lucide-react';
import {
  describeGeoError,
  getCurrentPosition,
  isGeolocationSupported,
  type Coordinates,
  type GeoErrorCode
} from '../../services/geo';

export const RADIUS_OPTIONS_KM = [5, 10, 25, 50] as const;
export type RadiusOption = (typeof RADIUS_OPTIONS_KM)[number] | 0; // 0 = Any distance

export const DEFAULT_RADIUS_KM: RadiusOption = 10;

export interface SeekerLocationState {
  coords: Coordinates | null;
  city: string;
  /** True once the seeker has explicitly opted-in via geolocation. */
  hasGranted: boolean;
}

export const EMPTY_SEEKER_LOCATION: SeekerLocationState = {
  coords: null,
  city: '',
  hasGranted: false
};

// ============================================================================
// localStorage bridge — keeps the seeker's most recent coords client-side so
// downstream pages (provider profile, etc.) can pass them to distance-aware
// endpoints without ever persisting the raw GPS reading on the server past
// the seeker's last search.
// ============================================================================

const SEEKER_LOCATION_STORAGE_KEY = 'flexywork_seeker_location_v1';

export function loadStoredSeekerLocation(): SeekerLocationState {
  if (typeof window === 'undefined') return EMPTY_SEEKER_LOCATION;
  try {
    const raw = window.localStorage.getItem(SEEKER_LOCATION_STORAGE_KEY);
    if (!raw) return EMPTY_SEEKER_LOCATION;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      (parsed.coords === null ||
        (Number.isFinite(parsed.coords?.latitude) &&
          Number.isFinite(parsed.coords?.longitude))) &&
      typeof parsed.city === 'string' &&
      typeof parsed.hasGranted === 'boolean'
    ) {
      return parsed as SeekerLocationState;
    }
  } catch {}
  return EMPTY_SEEKER_LOCATION;
}

export function persistSeekerLocation(state: SeekerLocationState): void {
  if (typeof window === 'undefined') return;
  try {
    if (!state.coords && !state.city && !state.hasGranted) {
      window.localStorage.removeItem(SEEKER_LOCATION_STORAGE_KEY);
    } else {
      window.localStorage.setItem(SEEKER_LOCATION_STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // Storage quota errors must not break the app.
  }
}

interface LocationControlProps {
  value: SeekerLocationState;
  radius: RadiusOption;
  onChange: (next: SeekerLocationState) => void;
  onRadiusChange: (radius: RadiusOption) => void;
  compact?: boolean;
}

export default function LocationControl({
  value,
  radius,
  onChange,
  onRadiusChange,
  compact = false
}: LocationControlProps) {
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<{ code: GeoErrorCode; message: string } | null>(null);
  const [cityDraft, setCityDraft] = useState(value.city);
  const [showCityInput, setShowCityInput] = useState(false);
  const geoSupported = isGeolocationSupported();

  useEffect(() => {
    setCityDraft(value.city);
  }, [value.city]);

  const handleDetect = async () => {
    setError(null);
    setDetecting(true);
    const result = await getCurrentPosition();
    setDetecting(false);
    if (result.ok) {
      onChange({ coords: result.coords, city: value.city, hasGranted: true });
    } else {
      setError({ code: result.code, message: result.message });
    }
  };

  const handleCitySubmit = () => {
    const trimmed = cityDraft.trim();
    if (!trimmed) return;
    onChange({ coords: null, city: trimmed, hasGranted: false });
    setError(null);
    setShowCityInput(false);
  };

  const handleClear = () => {
    onChange(EMPTY_SEEKER_LOCATION);
    setCityDraft('');
    setError(null);
    setShowCityInput(false);
  };

  return (
    <div className={`${compact ? '' : 'space-y-3 border-t border-surface-border pt-4'} space-y-3`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-ink-muted">Location</span>
        {(value.coords || value.city || value.hasGranted) && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-wider"
          >
            Clear
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleDetect}
        disabled={detecting || !geoSupported}
        title={
          geoSupported
            ? 'Use your browser location for nearby matches'
            : 'Your browser does not support geolocation'
        }
        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all ${
          value.hasGranted && value.coords
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            : 'border-surface-border bg-white text-ink hover:bg-stone-50'
        } ${!geoSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {detecting ? (
          <Loader2 size={14} className="animate-spin shrink-0" />
        ) : (
          <Crosshair size={14} className="shrink-0" />
        )}
        {detecting
          ? 'Detecting…'
          : value.hasGranted && value.coords
          ? 'Update Current Location'
          : 'Use my current location'}
      </button>

      {value.city && (
        <div className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xxs font-bold text-brand-800">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{value.city}</span>
        </div>
      )}

      {showCityInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={cityDraft}
            onChange={(e) => setCityDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCitySubmit();
              }
            }}
            placeholder="e.g. Vijayawada"
            className="flex-1 rounded-lg border border-surface-border bg-stone-50/40 px-3 py-2 text-xs font-medium text-ink placeholder:text-ink-subtle"
            maxLength={80}
            autoFocus
          />
          <button
            type="button"
            onClick={handleCitySubmit}
            disabled={!cityDraft.trim()}
            className="rounded-lg bg-brand-500 hover:bg-brand-600 text-white px-3 text-xs font-bold disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCityInput(false);
              setCityDraft(value.city);
            }}
            className="rounded-lg border border-surface-border bg-white text-ink-muted px-2 text-xs font-bold hover:bg-stone-50"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCityInput(true)}
          className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-wider"
        >
          <MapPin size={11} />
          {value.city ? 'Change city' : 'Enter city manually'}
        </button>
      )}

      {error && (
        <div className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xxs font-semibold text-amber-900">
          <AlertCircle size={12} className="shrink-0 mt-0.5" />
          <span className="leading-snug">{describeGeoError(error.code) || error.message}</span>
        </div>
      )}

      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-xxs font-bold text-ink-subtle uppercase tracking-wider">
          <span>Distance</span>
          <span className="text-ink font-semibold">
            {radius === 0 ? 'Any distance' : `Within ${radius} km`}
          </span>
        </div>
        <div className="relative">
          <select
            value={radius}
            onChange={(e) => onRadiusChange(Number(e.target.value) as RadiusOption)}
            aria-label="Search radius"
            className="w-full appearance-none rounded-lg border border-surface-border bg-white pl-3 pr-8 py-2 text-xs font-bold text-ink"
          >
            {[5, 10, 25, 50].map((km) => (
              <option key={km} value={km}>
                Within {km} km
              </option>
            ))}
            <option value={0}>Any distance</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}