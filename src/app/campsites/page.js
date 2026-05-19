'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import CampsiteCard from '@/components/home/CampsiteCard';
import LocationAutocomplete from '@/components/LocationAutocomplete';

/* ─────────────────────────────────────────────
   MOCK CAMPSITE DATA — swap back to useQuery later
───────────────────────────────────────────── */
const DUMMY_CAMPSITES = [
  {
    _id: '1',
    name: 'Starfall Meadow Camp',
    slug: 'starfall-meadow-camp',
    type: 'Glamping',
    city: 'Manali',
    state: 'HP',
    location: 'Manali, HP',
    guests: 4,
    price: 4500,
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000&auto=format&fit=crop',
  },
  {
    _id: '2',
    name: 'Spiti Wilderness Retreat',
    slug: 'spiti-wilderness-retreat',
    type: 'Camping',
    city: 'Kaza',
    state: 'HP',
    location: 'Spiti Valley, HP',
    guests: 6,
    price: 3200,
    rating: 4.8,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1000&auto=format&fit=crop',
  },
  {
    _id: '3',
    name: 'Riverside Forest Lodge',
    slug: 'riverside-forest-lodge',
    type: 'Eco Stay',
    city: 'Rishikesh',
    state: 'UK',
    location: 'Rishikesh, UK',
    guests: 8,
    price: 5800,
    rating: 4.7,
    reviews: 212,
    image: 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?q=80&w=1000&auto=format&fit=crop',
  },
  {
    _id: '4',
    name: 'Coorg Canopy Nest',
    slug: 'coorg-canopy-nest',
    type: 'Treehouse',
    city: 'Coorg',
    state: 'KA',
    location: 'Coorg, KA',
    guests: 2,
    price: 7200,
    rating: 5.0,
    reviews: 61,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
  },
  {
    _id: '5',
    name: 'Valley of Flowers Basecamp',
    slug: 'valley-of-flowers-basecamp',
    type: 'Camping',
    city: 'Chamoli',
    state: 'UK',
    location: 'Valley of Flowers, UK',
    guests: 10,
    price: 2800,
    rating: 4.6,
    reviews: 77,
    image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=1000&auto=format&fit=crop',
  },
  {
    _id: '6',
    name: 'Chopta Alpine Pods',
    slug: 'chopta-alpine-pods',
    type: 'Glamping',
    city: 'Chopta',
    state: 'UK',
    location: 'Chopta, UK',
    guests: 3,
    price: 6100,
    rating: 4.8,
    reviews: 43,
    image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1000&auto=format&fit=crop',
  },
  {
    _id: '7',
    name: 'Kasol Creekside Camp',
    slug: 'kasol-creekside-camp',
    type: 'Camping',
    city: 'Kasol',
    state: 'HP',
    location: 'Kasol, HP',
    guests: 6,
    price: 2200,
    rating: 4.5,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?q=80&w=1000&auto=format&fit=crop',
  },
  {
    _id: '8',
    name: 'Bir Billing Sky Lodge',
    slug: 'bir-billing-sky-lodge',
    type: 'Eco Stay',
    city: 'Bir',
    state: 'HP',
    location: 'Bir Billing, HP',
    guests: 4,
    price: 5400,
    rating: 4.9,
    reviews: 57,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
  },
];

function CampsitesContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [search, setSearch]   = useState(() => searchParams.get('search') || '');
  const [state,  setState]    = useState(() => searchParams.get('state')  || '');
  const [city,   setCity]     = useState(() => searchParams.get('city')   || '');
  const [locationDisplay, setLocationDisplay] = useState(
    () => [searchParams.get('city'), searchParams.get('state')].filter(Boolean).join(', ') || searchParams.get('search') || ''
  );
  const [nearMe, setNearMe]    = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  /* ── Parallax ── */
  const { scrollY } = useScroll();
  const bgY     = useTransform(scrollY, [0, 600], ['0%', '25%']);
  const textY   = useTransform(scrollY, [0, 600], ['0%', '12%']);
  const searchY = useTransform(scrollY, [0, 600], ['0%', '6%']);

  /* ── TEMPORARY: use dummy data, remove this block and restore useQuery later ── */
  const campsites  = DUMMY_CAMPSITES;
  const totalPages = 1;
  const isLoading  = false;

  const pushUrl = (s, st, ci) => {
    const params = new URLSearchParams();
    if (s)  params.set('search', s);
    if (st) params.set('state',  st);
    if (ci) params.set('city',   ci);
    router.replace(`/campsites?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    pushUrl(search, state, city);
  };

  const handleLocationSelect = ({ city: c, state: s, display }) => {
    setCity(c); setState(s); setLocationDisplay(display);
    setNearMe(false);
  };

  const handleLocationChange = (val) => {
    setLocationDisplay(val);
    if (!val) { setCity(''); setState(''); setNearMe(false); }
  };

  const handleClear = () => {
    setCity(''); setState(''); setLocationDisplay(''); setSearch('');
    setNearMe(false);
    pushUrl('', '', '');
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearMe(true);
        setCity(''); setState(''); setSearch('');
        setLocationDisplay('Near me (50 km)');
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    );
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen">

      {/* ── CINEMATIC PARALLAX HERO ── */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center pt-32 pb-24 min-h-[500px] lg:min-h-[60vh] lg:max-h-[720px]">

        {/* Layer 1: Background Image */}
        <motion.div
          className="absolute inset-x-0 -top-[20%] -bottom-[20%] z-0 pointer-events-none"
          style={{ y: bgY }}
        >
          <Image
            src="https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?q=80&w=2500&auto=format&fit=crop"
            alt="Scenic Campsite"
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#fcfcfc] to-transparent" />
        </motion.div>

        {/* Layer 2: Headline */}
        <motion.div
          className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center mt-12 mb-16"
          style={{ y: textY }}
        >
          <h1 className="text-white font-black text-5xl md:text-7xl lg:text-[5.5rem] tracking-[-0.04em] leading-[1.05] drop-shadow-xl mb-6">
            Sleep Under<br className="hidden sm:block" />
            <span className="text-[#84cc16]"> The Stars.</span>
          </h1>
          <p className="text-white/80 font-medium text-lg md:text-xl drop-shadow-md max-w-2xl mx-auto">
            Discover handpicked glamping retreats, forest lodges, and wilderness camps across India's most breathtaking landscapes.
          </p>
        </motion.div>

        {/* Layer 3: Floating Search Bar */}
        <motion.div
          className="relative z-20 w-full max-w-[1000px] mx-auto px-4 sm:px-6 md:px-12"
          style={{ y: searchY }}
        >
          <div className="bg-white/95 backdrop-blur-3xl border border-white/50 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.25)] rounded-[2.5rem] md:rounded-full p-2 md:p-3">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-gray-200/60 min-h-[70px]">

              {/* Location */}
              <div className="flex-[2] w-full px-5 lg:px-7 py-3 md:py-0 relative group flex flex-col justify-center h-full">
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Location</label>
                <div className="relative z-50 w-full -ml-1">
                  <LocationAutocomplete
                    label=""
                    value={locationDisplay}
                    onChange={handleLocationChange}
                    onSelect={handleLocationSelect}
                    placeholder="Search cities..."
                  />
                </div>
                {locationDisplay && (
                  <button type="button" onClick={() => handleLocationChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 z-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>

              {/* Name Search */}
              <div className="flex-[2] w-full px-5 lg:px-7 py-3 md:py-0 flex flex-col justify-center h-full">
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Camp Name</label>
                <input
                  type="text"
                  placeholder="e.g. Starfall Meadow..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-gray-900 text-sm font-bold focus:outline-none placeholder-gray-400 w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="w-full md:w-auto px-2 py-3 md:py-1 flex items-center justify-center gap-2 shrink-0 pl-2 lg:pl-3">
                <button
                  type="button"
                  onClick={handleNearMe}
                  disabled={geoLoading}
                  title="Find Near Me"
                  className="w-12 h-12 md:w-[60px] md:h-[60px] rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors shadow-sm"
                >
                  {geoLoading
                    ? <span className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
                    : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  }
                </button>
                <button
                  type="submit"
                  className="h-12 md:h-[60px] px-8 bg-[#84cc16] text-white rounded-full text-sm font-black uppercase tracking-wide hover:bg-[#74b814] hover:shadow-[0_10px_30px_-5px_rgba(132,204,22,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <span>Search</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </section>

      {/* ── AUTO-SCROLL MARQUEE ── */}
      <section className="relative w-full py-10 md:py-12 bg-white overflow-hidden border-b border-gray-100 flex flex-col items-center justify-center z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-5 text-center">
          Explore India's Most Scenic Camp Spots
        </p>
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-40 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-40 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />
        <div className="flex w-full overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap items-center w-max"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ ease: 'linear', duration: 38, repeat: Infinity }}
          >
            {[
              'Spiti Valley', 'Chopta', 'Rishikesh', 'Coorg', 'Munnar', 'Auli', 'Ziro', 'Tirthan',
              'Kasol', 'Bir Billing', 'Dandeli', 'Wayanad', 'Valley of Flowers', 'Nainital', 'Dhanaulti', 'Hampi',
              'Spiti Valley', 'Chopta', 'Rishikesh', 'Coorg', 'Munnar', 'Auli', 'Ziro', 'Tirthan',
              'Kasol', 'Bir Billing', 'Dandeli', 'Wayanad', 'Valley of Flowers', 'Nainital', 'Dhanaulti', 'Hampi',
            ].map((dest, i) => (
              <div key={i} className="flex items-center">
                <span className="text-lg md:text-2xl font-black text-gray-900 uppercase tracking-tighter px-6 md:px-12 hover:text-[#84cc16] hover:scale-110 transition-all duration-300 cursor-default select-none">
                  {dest}
                </span>
                <span className="text-[#84cc16] text-lg">✦</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CATALOG ── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 xl:px-20 pt-8 md:pt-12 pb-32">

        {/* Heading */}
        <div className="text-center mb-0 md:mb-4">
          <div className="inline-flex items-center gap-2 bg-[#84cc16]/10 border border-[#84cc16]/20 text-[#84cc16] text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] animate-pulse" />
            {isLoading ? 'Searching...' : `${campsites.length} campsite${campsites.length !== 1 ? 's' : ''} available`}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            {(search || city || state)
              ? <><span className="text-gray-400 font-light">Results for </span>{search || locationDisplay}</>
              : <>Our <span className="text-[#84cc16]">Campsites</span></>
            }
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <span className="w-12 h-[2px] bg-gray-200 rounded-full" />
            <span className="text-gray-300">✦</span>
            <span className="w-12 h-[2px] bg-gray-200 rounded-full" />
          </div>
        </div>

        {/* Active filters */}
        {(city || state) && (
          <div className="flex items-center gap-2 mt-6 mb-2 flex-wrap justify-center">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Filters:</span>
            {city  && <span className="text-xs bg-lime-50 text-lime-700 border border-lime-200 rounded-full px-3 py-1 font-bold">{city}</span>}
            {state && <span className="text-xs bg-lime-50 text-lime-700 border border-lime-200 rounded-full px-3 py-1 font-bold">{state}</span>}
            <button onClick={handleClear} className="text-sm font-bold text-[#84cc16] hover:text-[#74b814] ml-1">Clear All</button>
          </div>
        )}

        {/* Grid Container */}
        <div className="bg-white rounded-[2.5rem] lg:rounded-[3.5rem] shadow-sm border border-gray-100 p-6 sm:p-10 lg:p-16 mt-10 min-h-[50vh]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[450px] rounded-[2rem] bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : campsites.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-gray-500 text-xl font-bold mb-6">No campsites match your search.</p>
              <button onClick={handleClear} className="px-8 py-4 bg-gray-900 text-white font-bold rounded-full shadow-lg hover:bg-black transition-all">
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {campsites.map((c) => <CampsiteCard key={c._id} campsite={c} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-16">
              <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 text-gray-900 rounded-full disabled:opacity-30 hover:border-gray-900 transition-all font-bold shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="text-sm font-black text-gray-900 tracking-widest uppercase">1 / {totalPages}</span>
              <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 text-gray-900 rounded-full disabled:opacity-30 hover:border-gray-900 transition-all font-bold shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function CampsitesPage() {
  return (
    <Suspense fallback={
      <div className="bg-white min-h-screen pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CampsitesContent />
    </Suspense>
  );
}
