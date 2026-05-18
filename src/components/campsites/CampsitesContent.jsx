'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import CampsiteCard from '@/components/home/CampsiteCard';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { getCampsites } from '@/services/campsites.service';

export default function CampsitesContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const limit = 12;

  const [search, setSearch]   = useState(() => searchParams.get('search') || '');
  const [state,  setState]    = useState(() => searchParams.get('state')  || '');
  const [city,   setCity]     = useState(() => searchParams.get('city')   || '');
  const [locationDisplay, setLocationDisplay] = useState(
    () => [searchParams.get('city'), searchParams.get('state')].filter(Boolean).join(', ') || searchParams.get('search') || ''
  );
  const [nearMe,     setNearMe]     = useState(false);
  const [userLat,    setUserLat]    = useState(null);
  const [userLng,    setUserLng]    = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [page,       setPage]       = useState(1);

  const pushUrl = (s, st, ci, p = 1) => {
    const params = new URLSearchParams();
    if (s)  params.set('search', s);
    if (st) params.set('state',  st);
    if (ci) params.set('city',   ci);
    if (p > 1) params.set('page', p);
    router.replace(`/campsites?${params.toString()}`, { scroll: false });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['public-campsites', search, state, city, nearMe, userLat, userLng, page],
    queryFn: () => getCampsites({
      ...(nearMe && userLat && userLng
        ? { lat: userLat, lng: userLng, radius: 50 }
        : { search: search || undefined, state: state || undefined, city: city || undefined }
      ),
      page,
      limit,
    }),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const campsites  = data?.campsites ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    pushUrl(search, state, city, 1);
  };

  const handleLocationSelect = ({ city: c, state: s, display }) => {
    setCity(c); setState(s); setLocationDisplay(display);
    setNearMe(false); setSearch(''); setPage(1);
    pushUrl('', s, c, 1);
  };

  const handleLocationChange = (val) => {
    setLocationDisplay(val);
    if (!val) { setCity(''); setState(''); setNearMe(false); setUserLat(null); setUserLng(null); }
  };

  const handleClear = () => {
    setCity(''); setState(''); setLocationDisplay(''); setSearch('');
    setNearMe(false); setUserLat(null); setUserLng(null);
    setPage(1); pushUrl('', '', '', 1);
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude);
        setNearMe(true); setCity(''); setState(''); setSearch('');
        setLocationDisplay('Near me (50 km)'); setPage(1); setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    );
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="relative pt-16" style={{ background: 'linear-gradient(135deg, #0a0f1a 0%, #001a0a 60%, #002210 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 right-0 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #84cc16 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 xl:px-20 pt-10 pb-12">
          <p className="text-[#84cc16] text-xs font-black uppercase tracking-[0.22em] mb-3">Curated Stays</p>
          <h1 className="text-white font-black leading-none mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}>
            Browse All Campsites
          </h1>
          <p className="text-white/45 text-sm mb-8 max-w-lg">Discover unique glamping experiences across India's most stunning natural landscapes.</p>

          <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[220px] relative">
              <LocationAutocomplete
                label="Location"
                value={locationDisplay}
                onChange={handleLocationChange}
                onSelect={handleLocationSelect}
                placeholder="City or state..."
              />
              {locationDisplay && (
                <button type="button" onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg leading-none">×</button>
              )}
            </div>

            <button type="button" onClick={handleNearMe} disabled={geoLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>
              {geoLoading
                ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" /></svg>
              }
              Near Me
            </button>

            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-white placeholder-white/30"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            />

            <button type="submit"
              className="px-6 py-2.5 bg-[#84cc16] text-gray-900 font-bold text-sm rounded-xl hover:brightness-110 transition-all">
              Search
            </button>

            {(locationDisplay || search) && (
              <button type="button" onClick={handleClear}
                className="px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 xl:px-20 py-10">
        {(city || state) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-gray-400">Showing results for:</span>
            {city  && <span className="text-xs bg-lime-50 text-lime-700 border border-lime-200 rounded-full px-3 py-1">{city}</span>}
            {state && <span className="text-xs bg-lime-50 text-lime-700 border border-lime-200 rounded-full px-3 py-1">{state}</span>}
          </div>
        )}
        {!isLoading && (
          <p className="text-xs text-gray-400 mb-6">{total} campsite{total !== 1 ? 's' : ''} found</p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : campsites.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-sm mb-3">No campsites found for your search.</p>
            <button onClick={handleClear} className="text-[#84cc16] text-sm font-semibold hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {campsites.map((c) => <CampsiteCard key={c._id} campsite={c} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => { setPage((p) => Math.max(1, p - 1)); pushUrl(search, state, city, page - 1); }}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl disabled:opacity-40 hover:border-[#84cc16] transition-colors">
              ← Prev
            </button>
            <span className="text-sm text-gray-500">{page} / {totalPages}</span>
            <button onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); pushUrl(search, state, city, page + 1); }}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl disabled:opacity-40 hover:border-[#84cc16] transition-colors">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
