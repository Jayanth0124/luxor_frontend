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
  const router = useRouter();

  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [state, setState] = useState(() => searchParams.get('state') || '');
  const [city, setCity] = useState(() => searchParams.get('city') || '');
  const [locationDisplay, setLocationDisplay] = useState(
    () => [searchParams.get('city'), searchParams.get('state')].filter(Boolean).join(', ') || searchParams.get('search') || ''
  );
  const [nearMe, setNearMe] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  /* ── Parallax ── */
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], ['0%', '25%']);
  const textY = useTransform(scrollY, [0, 600], ['0%', '12%']);
  const searchY = useTransform(scrollY, [0, 600], ['0%', '6%']);

  /* ── TEMPORARY: use dummy data, remove this block and restore useQuery later ── */
  const campsites = DUMMY_CAMPSITES;
  const totalPages = 1;
  const isLoading = false;

  const pushUrl = (s, st, ci) => {
    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (st) params.set('state', st);
    if (ci) params.set('city', ci);
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
      <section className="relative w-full py-10 md:py-12 bg-[#fcfcfc] overflow-hidden border-b border-gray-100 flex flex-col items-center justify-center z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-5 text-center">
          Explore India's Most Scenic Spots
        </p>
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-40 bg-gradient-to-r from-[#fcfcfc] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-40 bg-gradient-to-l from-[#fcfcfc] to-transparent z-20 pointer-events-none" />
        <div className="flex w-full overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap items-center w-max"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ ease: 'linear', duration: 45, repeat: Infinity }}
          >
            {[
              'Pangong Tso', 'Kheerganga', 'Triund', 'Sandakphu', 'Mawlynnong', 'Chandratal', 'Tso Moriri', 'Gurez Valley', 'Zanskar', 'Nanda Devi', 'Tirthan Valley', 'Chopta', 'Auli', 'Kodaikanal', 'Munnar', 'Spiti',
              'Pangong Tso', 'Kheerganga', 'Triund', 'Sandakphu', 'Mawlynnong', 'Chandratal', 'Tso Moriri', 'Gurez Valley', 'Zanskar', 'Nanda Devi', 'Tirthan Valley', 'Chopta', 'Auli', 'Kodaikanal', 'Munnar', 'Spiti'
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

      {/* ── ADVANCED CATALOG UI (Beyond Limits) ── */}
      <section className="relative min-h-[80vh] w-full overflow-hidden pt-20 pb-40">

        {/* Deep Background Ambient Orbs (Parallaxing) */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] bg-gradient-to-r from-[#84cc16]/10 to-transparent rounded-full blur-[120px] opacity-70"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] bg-gradient-to-l from-emerald-600/5 to-transparent rounded-full blur-[150px] opacity-60"
          />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 xl:px-20">

          {/* Epic Typographic Header */}
          <div className="relative text-center mb-16 md:mb-24">
            <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.02]">
              <h2 className="text-[12vw] font-black uppercase tracking-tighter whitespace-nowrap leading-none mt-10">Wilderness</h2>
            </div>
            <h2 className="relative text-5xl md:text-7xl lg:text-[5rem] font-black text-gray-900 tracking-[-0.04em] leading-[0.95]">
              {(search || city || state)
                ? <>Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#84cc16] to-emerald-600">Destinations</span></>
                : <>Untamed <br className="hidden md:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#84cc16] to-emerald-600">Sanctuaries</span></>
              }
            </h2>
            <p className="mt-6 text-gray-500 font-bold tracking-widest text-xs md:text-sm max-w-xl mx-auto uppercase">
              Transcend the ordinary. Immerse in nature's ultimate luxury.
            </p>
          </div>

          {/* Sticky Floating Status Pill */}
          <div className="sticky top-24 z-40 flex justify-center mb-16 pointer-events-none">
            <div className="pointer-events-auto bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-full px-5 py-2.5 flex items-center gap-4 transition-all">
              <div className="flex items-center gap-2 pr-4 border-r border-gray-200/50">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inset-0 rounded-full bg-[#84cc16] opacity-75"></span>
                  <span className="relative rounded-full w-2 h-2 bg-[#84cc16]"></span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">
                  {isLoading ? 'Scanning...' : 'Live Catalog'}
                </span>
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-3">
                <span>{campsites.length} Results</span>
                {(city || state || search) && (
                  <button onClick={handleClear} className="text-[#84cc16] hover:text-gray-900 transition-colors">Clear Filters</button>
                )}
              </div>
            </div>
          </div>

          {/* Standard Premium Aligned Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[480px] rounded-[2.5rem] bg-gray-200/50 animate-pulse backdrop-blur-sm" />
              ))}
            </div>
          ) : campsites.length === 0 ? (
            <div className="text-center py-32 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white shadow-xl max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-gray-900 text-2xl font-black mb-2 tracking-tight">No Sanctuaries Found</p>
              <p className="text-gray-500 font-medium mb-8">Try adjusting your filters to discover more hidden gems.</p>
              <button onClick={handleClear} className="px-8 py-4 bg-[#84cc16] text-white font-black uppercase tracking-widest text-xs rounded-full shadow-[0_10px_30px_rgba(132,204,22,0.3)] hover:scale-105 transition-all">
                Reset Exploration
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {campsites.map((c) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <CampsiteCard campsite={c} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Futuristic Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-32 relative z-20">
              <button className="group w-14 h-14 flex items-center justify-center bg-white/80 backdrop-blur-xl border border-white text-gray-900 rounded-full disabled:opacity-30 hover:border-[#84cc16] transition-all font-bold shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Page</span>
                <span className="text-lg font-black text-gray-900 tracking-widest">{page} / {totalPages}</span>
              </div>
              <button className="group w-14 h-14 flex items-center justify-center bg-white/80 backdrop-blur-xl border border-white text-gray-900 rounded-full disabled:opacity-30 hover:border-[#84cc16] transition-all font-bold shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
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
      <div className="bg-[#fcfcfc] min-h-screen pt-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CampsitesContent />
    </Suspense>
  );
}