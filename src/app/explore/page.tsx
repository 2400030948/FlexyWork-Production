'use client';

import React, { Suspense, useEffect, useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, ShieldCheck, Star, X, MapPin, Compass } from 'lucide-react';
import { getProviders } from '../../services/providers';
import { WorkerProfile } from '../../types';
import ProviderCard from '../../components/shared/ProviderCard';
import EmptyState from '../../components/ui/EmptyState';
import LocationControl, {
  DEFAULT_RADIUS_KM,
  EMPTY_SEEKER_LOCATION,
  loadStoredSeekerLocation,
  persistSeekerLocation,
  type RadiusOption,
  type SeekerLocationState
} from '../../components/shared/LocationControl';
import { updateMyLocation } from '../../services/auth';

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Search Params
  const queryParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  // Filter States
  const [search, setSearch] = useState(queryParam);
  const [category, setCategory] = useState(categoryParam);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Location & radius state
  const [seekerLocation, setSeekerLocation] = useState<SeekerLocationState>(EMPTY_SEEKER_LOCATION);
  const [radius, setRadius] = useState<RadiusOption>(DEFAULT_RADIUS_KM);

  // Hydrate from localStorage on first mount so the same location flows
  // through the provider profile page.
  useEffect(() => {
    setSeekerLocation(loadStoredSeekerLocation());
  }, []);

  const [providers, setProviders] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [noNearbyMatch, setNoNearbyMatch] = useState(false);
  const [currentSearchRadius, setCurrentSearchRadius] = useState<RadiusOption>(DEFAULT_RADIUS_KM);

  // Sync params to local search state
  useEffect(() => {
    setSearch(queryParam);
    setCategory(categoryParam);
  }, [queryParam, categoryParam]);

  // Load and filter data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNoNearbyMatch(false);
      try {
        const data = await getProviders({
          search,
          category,
          lat: seekerLocation.coords?.latitude ?? null,
          lng: seekerLocation.coords?.longitude ?? null,
          radius: seekerLocation.coords ? radius : null,
          minRating: minRating || undefined
        });

        const finalData = data.filter(w => w.hourlyRate <= maxPrice);
        setProviders(finalData);

        // Detect "no nearby workers" outcome so we can show the empty
        // state with the wider-area recovery action.
        if (seekerLocation.coords && finalData.length === 0) {
          setNoNearbyMatch(true);
          setCurrentSearchRadius(radius);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, category, seekerLocation, radius, minRating, maxPrice]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSeekerLocation(EMPTY_SEEKER_LOCATION);
    setRadius(DEFAULT_RADIUS_KM);
    setOnlyVerified(false);
    setMinRating(0);
    setMaxPrice(500);
    router.push('/explore');
  };

  const widenSearch = () => {
    // Jump to "Any distance" so we surface workers from anywhere.
    setRadius(0);
    setNoNearbyMatch(false);
  };

  // Persist the seeker location to the backend whenever it changes,
  // best-effort — failures here must not break local search behaviour.
  useEffect(() => {
    // Mirror to localStorage immediately so the provider profile page can
    // pick the same coords up without re-asking for permission.
    persistSeekerLocation(seekerLocation);

    if (!seekerLocation.coords && !seekerLocation.city) return;
    const payload: { city?: string; latitude?: number; longitude?: number } = {};
    if (seekerLocation.city) payload.city = seekerLocation.city;
    if (seekerLocation.coords) {
      payload.latitude = seekerLocation.coords.latitude;
      payload.longitude = seekerLocation.coords.longitude;
    }
    updateMyLocation(payload).catch(() => {});
  }, [seekerLocation]);

  const categories = ['Cleaning', 'Repairs', 'Gardening', 'Elder Care', 'Cooking'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">Find someone who can get it done.</h1>
        <p className="text-xs text-ink-muted mt-0.5">Browse and filter verified local service providers in Vijayawada.</p>
      </div>

      {/* Search Header Row */}
      <div className="flex gap-3">
        <div className="relative flex-grow">
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-subtle" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by provider name or specific skill e.g. 'deep clean'..."
            className="w-full rounded-2xl border border-surface-border bg-white py-3 pl-12 pr-4 text-sm text-ink placeholder-ink-subtle font-medium shadow-sm"
          />
        </div>
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden flex items-center justify-center gap-1.5 rounded-2xl bg-white border border-surface-border px-4 py-3 text-sm font-bold text-ink hover:bg-stone-50"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      {/* Filters & Results Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Desktop Filters panel */}
        <aside className="hidden md:block space-y-6 bg-white border border-surface-border rounded-2xl p-6 h-fit shadow-sm">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
              <SlidersHorizontal size={14} />
              Filter Results
            </h3>
            <button onClick={clearFilters} className="text-xxs font-bold text-brand-600 hover:underline">
              Clear All
            </button>
          </div>

          {/* Categories select list */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-ink-muted">Category</label>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setCategory('')}
                className={`text-xs font-semibold py-1.5 px-2 rounded-lg text-left transition-colors ${
                  category === '' ? 'bg-brand-50 text-brand-700' : 'hover:bg-stone-50 text-ink-muted'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs font-semibold py-1.5 px-2 rounded-lg text-left transition-colors ${
                    category === cat ? 'bg-brand-50 text-brand-700' : 'hover:bg-stone-50 text-ink-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range filter */}
          <div className="space-y-2 border-t border-surface-border pt-4">
            <div className="flex justify-between items-center text-xs font-bold text-ink-muted">
              <span>Max Hourly Budget</span>
              <span className="text-ink font-semibold">₹{maxPrice}/hr</span>
            </div>
            <input
              type="range"
              min="150"
              max="600"
              step="25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-ink-subtle font-semibold">
              <span>₹150</span>
              <span>₹600</span>
            </div>
          </div>

          {/* Distance range filter */}
          <div className="space-y-2 border-t border-surface-border pt-4">
            <div className="flex justify-between items-center text-xs font-bold text-ink-muted">
              <span>Max Distance Radius</span>
              <span className="text-ink font-semibold">
                {radius === 0 ? 'Any distance' : `${radius} km`}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={radius === 0 ? 50 : radius}
              onChange={(e) => setRadius(Number(e.target.value) as RadiusOption)}
              className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-ink-subtle font-semibold">
              <span>1 km</span>
              <span>Any</span>
            </div>
          </div>

          {/* Rating filter */}
          <div className="space-y-2 border-t border-surface-border pt-4">
            <label className="text-xs font-bold text-ink-muted">Rating Requirement</label>
            <div className="flex gap-2">
              {[0, 4.5, 4.8].map(r => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    minRating === r
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-surface-border bg-white text-ink-muted hover:bg-stone-50'
                  }`}
                >
                  {r === 0 ? 'Any' : `${r}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Verification check filter */}
          <div className="space-y-2 border-t border-surface-border pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500 accent-brand-500"
              />
              <span className="text-xs font-bold text-ink-muted flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" /> Verified Workers Only
              </span>
            </label>
          </div>

          {/* Geo-location + radius (desktop) */}
          <LocationControl
            value={seekerLocation}
            radius={radius}
            onChange={setSeekerLocation}
            onRadiusChange={setRadius}
          />
        </aside>

        {/* Search Results */}
        <section className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-white border border-surface-border p-5 animate-pulse space-y-4">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 rounded-xl bg-stone-100 shrink-0" />
                    <div className="space-y-2 flex-grow">
                      <div className="h-4 w-32 bg-stone-100 rounded" />
                      <div className="h-3 w-16 bg-stone-100 rounded" />
                    </div>
                  </div>
                  <div className="h-16 bg-stone-100 rounded-xl" />
                  <div className="h-8 bg-stone-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : providers.length === 0 ? (
            noNearbyMatch ? (
              <EmptyState
                icon={Compass}
                title="No verified workers found nearby."
                description={
                  seekerLocation.city
                    ? `No approved workers within ${
                        currentSearchRadius === 0 ? 'any distance' : `${currentSearchRadius} km`
                      } of ${seekerLocation.city}. Try widening the search area.`
                    : `No approved workers within ${
                        currentSearchRadius === 0 ? 'any distance' : `${currentSearchRadius} km`
                      }. Try widening the search area.`
                }
                actionLabel="Search a wider area"
                onAction={widenSearch}
              />
            ) : (
              <EmptyState
                icon={Search}
                title="No skilled workers found nearby"
                description="Try expanding your search radius, lowering the minimum rating filter, or search with different keywords."
                actionLabel="Reset Discovery Filters"
                onAction={clearFilters}
              />
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {providers.map(p => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Mobile Drawer Slideup Sheet */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end flex-col animate-in fade-in duration-200 md:hidden">
          <div className="bg-white rounded-t-3xl border-t border-surface-border p-6 space-y-6 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-surface-border pb-3">
              <h3 className="font-bold text-sm text-ink">Discovery Filters</h3>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-ink-muted"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-muted">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory('')}
                  className={`text-xs font-semibold py-1.5 px-3 rounded-full border transition-all ${
                    category === '' ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold' : 'border-surface-border hover:bg-stone-50 text-ink-muted'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-xs font-semibold py-1.5 px-3 rounded-full border transition-all ${
                      category === cat ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold' : 'border-surface-border hover:bg-stone-50 text-ink-muted'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Price budget slider */}
            <div className="space-y-2 border-t border-surface-border pt-4">
              <div className="flex justify-between items-center text-xs font-bold text-ink-muted">
                <span>Max Hourly Budget</span>
                <span className="text-ink font-semibold">₹{maxPrice}/hr</span>
              </div>
              <input
                type="range"
                min="150"
                max="600"
                step="25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Mobile Location Control */}
            <LocationControl
              value={seekerLocation}
              radius={radius}
              onChange={setSeekerLocation}
              onRadiusChange={setRadius}
              compact
            />

            {/* Mobile verification checked toggle */}
            <div className="space-y-2 border-t border-surface-border pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500 accent-brand-500"
                />
                <span className="text-xs font-bold text-ink-muted flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" /> Verified Workers Only
                </span>
              </label>
            </div>

            {/* Submit mobile filters */}
            <div className="pt-2 border-t border-surface-border flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 rounded-xl border border-surface-border hover:bg-stone-50 py-3 text-xs font-bold text-ink transition-all"
              >
                Clear
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-3 text-xs font-bold shadow-md transition-all"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-xs font-semibold text-ink-subtle uppercase tracking-wider">Loading providers...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
