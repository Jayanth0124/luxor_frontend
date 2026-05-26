'use client';

import { useState, Suspense, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import CustomDatePicker from '@/components/CustomDatePicker';
import { getVehicles } from '@/services/vehicles.service';

/* ─────────────────────────────────────────────
   HELPERS & CATEGORIES
───────────────────────────────────────────── */
function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function normalize(v) {
  const price = v.price ?? v.pricing?.commonPrice ?? v.pricing?.perDayPrices?.[0]?.price ?? null;
  return {
    slug: v.slug || toSlug(v.name),
    name: v.name,
    category: v.category?.name ?? v.category ?? 'Vehicle',
    location: v.location ?? [v.city, v.state].filter(Boolean).join(', '),
    price,
    imgSrc: v.image ?? v.images?.[0]?.url ?? '/Images/car.jpg',
    seats: v.seats ?? v.seatingCapacity ?? '4',
    transmission: v.transmission ?? 'Auto',
    fuel: v.fuelType ?? 'Petrol'
  };
}

const CATEGORIES = [
  { id: '', label: 'All Vehicles' },
  { id: 'self-drive', label: 'Self Drive' },
  { id: 'caravans', label: 'Caravans (Tempo)' },
];

/* ─────────────────────────────────────────────
   LIGHT PREMIUM CARD UI
───────────────────────────────────────────── */
function PremiumLightCard({ vehicle }) {
  const v = normalize(vehicle);

  return (
    <Link href={`/vehicles/${v.slug}`} className="group block w-full h-full outline-none">
      <div className="bg-white rounded-[2rem] p-3 border border-gray-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 h-full flex flex-col relative overflow-hidden">

        {/* Top Image Container */}
        <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-gray-50 mb-5">
          <Image
            src={v.imgSrc}
            alt={v.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            unoptimized={v.imgSrc.startsWith('http')}
          />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm">
              {v.category}
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="px-3 flex-1 flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-xl md:text-[1.35rem] font-black text-gray-900 tracking-tight leading-tight mb-1.5 group-hover:text-[#84cc16] transition-colors line-clamp-1">
              {v.name}
            </h3>
            {v.location && (
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {v.location}
              </p>
            )}
          </div>

          {/* Clean Micro-UI Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {v.seats} Seats
            </span>
            <span className="bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              {v.transmission}
            </span>
            <span className="bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {v.fuel}
            </span>
          </div>

          {/* Pricing Footer */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">₹{Number(v.price).toLocaleString('en-IN')}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1.5">/ day</span>
            </div>

            <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[#84cc16] flex items-center justify-center transition-colors duration-300 text-gray-400 group-hover:text-white">
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   MAIN CONTENT COMPONENT
───────────────────────────────────────────── */
function VehiclesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const limit = 12;

  // Search State
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [state, setState] = useState(() => searchParams.get('state') || '');
  const [city, setCity] = useState(() => searchParams.get('city') || '');
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get('category') || '');
  const [startDate, setStartDate] = useState(() => searchParams.get('start') || '');
  const [endDate, setEndDate] = useState(() => searchParams.get('end') || '');

  const [locationDisplay, setLocationDisplay] = useState(
    () => [searchParams.get('city'), searchParams.get('state')].filter(Boolean).join(', ') || searchParams.get('search') || ''
  );

  // Date Picker State
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  // Near Me
  const [nearMe, setNearMe] = useState(false);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const [page, setPage] = useState(1);

  // Parallax Scroll (Fixed Import)
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], ['0%', '30%']);
  const textY = useTransform(scrollY, [0, 800], ['0%', '40%']);
  const searchY = useTransform(scrollY, [0, 600], ['0%', '-5%']);

  const pushUrl = (s, st, ci, cat, start, end, p = 1) => {
    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (st) params.set('state', st);
    if (ci) params.set('city', ci);
    if (cat) params.set('category', cat);
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    if (p > 1) params.set('page', p);
    router.replace(`/vehicles?${params.toString()}`, { scroll: false });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['public-vehicles', search, state, city, activeCategory, startDate, endDate, nearMe, userLat, userLng, page],
    queryFn: () => getVehicles({
      ...(nearMe && userLat && userLng
        ? { lat: userLat, lng: userLng, radius: 50 }
        : { search: search || undefined, state: state || undefined, city: city || undefined, category: activeCategory || undefined }
      ),
      page,
      limit,
    }),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const dummyVehicles = [
    {
      _id: '1',
      name: 'Luxor Expedition Defender',
      slug: 'luxor-expedition-defender',
      category: 'Expedition SUV',
      seatingCapacity: 5,
      city: 'Manali',
      state: 'HP',
      price: 8500,
      rating: 4.9,
      reviews: 42,
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop',
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Diesel'
    },
    {
      _id: '2',
      name: 'Overland Camper Cruiser',
      slug: 'overland-camper-cruiser',
      category: 'Campervan',
      seatingCapacity: 4,
      city: 'Leh',
      state: 'JK',
      price: 12000,
      rating: 4.8,
      reviews: 29,
      image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?q=80&w=1000&auto=format&fit=crop',
      seats: 4,
      transmission: 'Automatic',
      fuel: 'Petrol'
    },
    {
      _id: '3',
      name: 'Desert Storm Safari 4x4',
      slug: 'desert-storm-safari-4x4',
      category: 'Expedition SUV',
      seatingCapacity: 7,
      city: 'Jaisalmer',
      state: 'RJ',
      price: 9500,
      rating: 4.7,
      reviews: 56,
      image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1000&auto=format&fit=crop',
      seats: 7,
      transmission: 'Automatic',
      fuel: 'Petrol'
    },
    {
      _id: '4',
      name: 'Luxor Luxury Glamping Caravan',
      slug: 'luxor-luxury-glamping-caravan',
      category: 'Luxury Caravan',
      seatingCapacity: 4,
      city: 'Bengaluru',
      state: 'KA',
      price: 15000,
      rating: 5.0,
      reviews: 18,
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1000&auto=format&fit=crop',
      seats: 4,
      transmission: 'Automatic',
      fuel: 'Diesel'
    },
    {
      _id: '5',
      name: 'Western Ghats Trailblazer',
      slug: 'western-ghats-trailblazer',
      category: 'Camping Caravan',
      seatingCapacity: 5,
      city: 'Coorg',
      state: 'KA',
      price: 11000,
      rating: 4.8,
      reviews: 31,
      image: 'https://images.unsplash.com/photo-1513313778780-9ae4807465f2?q=80&w=1000&auto=format&fit=crop',
      seats: 5,
      transmission: 'Manual',
      fuel: 'Petrol'
    },
    {
      _id: '6',
      name: 'Conqueror Overland Truck',
      slug: 'conqueror-overland-truck',
      category: 'Heavy Duty Camper',
      seatingCapacity: 3,
      city: 'Shimla',
      state: 'HP',
      price: 18000,
      rating: 4.9,
      reviews: 15,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000&auto=format&fit=crop',
      seats: 3,
      transmission: 'Automatic',
      fuel: 'Diesel'
    }
  ];

  // TEMPORARY DUMMY DATA INJECTION
  const vehicles = dummyVehicles;
  const total = dummyVehicles.length;
  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e) => {
    e?.preventDefault();
    setPage(1);
    pushUrl(search, state, city, activeCategory, startDate, endDate, 1);
  };

  const handleClearFilters = () => {
    setCity(''); setState(''); setLocationDisplay(''); setSearch('');
    setActiveCategory(''); setStartDate(''); setEndDate('');
    setNearMe(false); setUserLat(null); setUserLng(null);
    setPage(1); pushUrl('', '', '', '', '', '', 1);
  };

  const handleLocationSelect = ({ city: c, state: s, display }) => {
    setCity(c); setState(s); setLocationDisplay(display);
    setNearMe(false);
  };

  const handleLocationChange = (val) => {
    setLocationDisplay(val);
    if (!val) { setCity(''); setState(''); setNearMe(false); setUserLat(null); setUserLng(null); }
  };

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    setPage(1);
    pushUrl(search, state, city, catId, startDate, endDate, 1);
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
    <div className="bg-[#fcfcfc] min-h-screen font-sans">

      {/* ── IMMERSIVE DEPTH PARALLAX HERO ── */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center pt-32 pb-24 min-h-[500px] lg:min-h-[55vh] lg:max-h-[700px]">

        {/* Layer 1 (Deepest): Background Parallax */}
        <motion.div
          className="absolute inset-x-0 -top-[20%] -bottom-[20%] z-0 pointer-events-none"
          style={{ y: bgY }}
        >
          <Image
            src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=2500&auto=format&fit=crop"
            alt="Scenic Mountain Road"
            fill
            className="object-cover"
            unoptimized
            priority
          />
          {/* Light black overlay for perfect white text contrast */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          {/* Bottom fade integration to the main white page */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#fcfcfc] to-transparent" />
        </motion.div>

        {/* Layer 2 (Middle): Typography Parallax */}
        <motion.div
          className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center mt-12 mb-16"
          style={{ y: textY }}
        >
          <h1 className="text-white font-black text-5xl md:text-7xl lg:text-[5.5rem] tracking-[-0.04em] leading-[1.05] drop-shadow-xl mb-6">
            CHASE THE <br className="hidden sm:block" />
            <span className="text-[#84cc16]">HORIZON</span>
          </h1>
          <p className="text-white/90 font-medium text-lg md:text-2xl drop-shadow-md max-w-2xl mx-auto">
            Experience the world's most breathtaking routes with our premium fleet of SUVs and luxury caravans.
          </p>
        </motion.div>

        {/* Layer 3 (Foreground): Integrated Search Console */}
        <motion.div
          className="relative z-20 w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12"
          style={{ y: searchY }}
        >
          <div className="bg-white/95 backdrop-blur-3xl border border-white/50 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.3)] rounded-[2.5rem] md:rounded-full p-2 md:p-3 transition-all duration-500">

            {/* Mobile Category Tabs */}
            <div className="flex md:hidden items-center justify-center gap-2 mb-4 pt-2 border-b border-gray-200/50 pb-4 overflow-x-auto">
              {CATEGORIES.map(cat => (
                <button key={cat.label} onClick={() => handleCategorySelect(cat.id)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeCategory === cat.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{cat.label}</button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-gray-200/60 min-h-[70px]">

              {/* Category (Desktop Integrated) */}
              <div className="hidden md:flex flex-1 w-full px-5 lg:px-7 py-3 md:py-0 relative group flex-col justify-center h-full">
                <div className="w-full relative z-10">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Vehicle Type</label>
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="w-full bg-transparent text-gray-900 text-sm font-bold focus:outline-none cursor-pointer appearance-none -ml-1"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id} className="text-gray-900 font-semibold">{cat.label}</option>
                    ))}
                  </select>
                </div>
                {/* Custom dropdown arrow */}
                <div className="absolute right-5 lg:right-7 top-1/2 -translate-y-1/2 pointer-events-none z-0">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Location */}
              <div className="flex-[1.5] w-full px-5 lg:px-7 py-3 md:py-0 relative group flex flex-col justify-center h-full">
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Pick-up Location</label>
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

              {/* Dates (Combined visual) */}
              <div className="flex-[2] w-full flex items-center divide-x divide-gray-200/60 h-full">
                <div className="flex-1 px-5 lg:px-7 py-3 md:py-0 relative cursor-pointer group hover:bg-black/[0.03] transition-colors rounded-l-[1.5rem] md:rounded-none h-full flex flex-col justify-center" onClick={() => setIsStartOpen(true)}>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Pick up Date</label>
                  <div className="text-sm font-bold text-gray-900 truncate">{startDate ? startDate.split(' ')[0] : 'Add date'}</div>
                  <AnimatePresence>
                    {isStartOpen && (
                      <CustomDatePicker
                        isOpen={isStartOpen}
                        onClose={() => setIsStartOpen(false)}
                        selectedDate={startDate}
                        onSelect={(d) => { setStartDate(d); setIsStartOpen(false); }}
                        showTime={true}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex-1 px-5 lg:px-7 py-3 md:py-0 relative cursor-pointer group hover:bg-black/[0.03] transition-colors rounded-r-[1.5rem] md:rounded-none h-full flex flex-col justify-center" onClick={() => setIsEndOpen(true)}>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Drop off Date</label>
                  <div className="text-sm font-bold text-gray-900 truncate">{endDate ? endDate.split(' ')[0] : 'Add date'}</div>
                  <AnimatePresence>
                    {isEndOpen && (
                      <CustomDatePicker
                        isOpen={isEndOpen}
                        onClose={() => setIsEndOpen(false)}
                        selectedDate={endDate}
                        onSelect={(d) => { setEndDate(d); setIsEndOpen(false); }}
                        minDate={startDate ? startDate.split(' ')[0] : undefined}
                        showTime={true}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full md:w-auto px-2 py-3 md:py-1 flex items-center justify-center gap-2 shrink-0 pl-2 lg:pl-3">
                <button type="button" onClick={handleNearMe} disabled={geoLoading} title="Find Near Me"
                  className="w-12 h-12 md:w-[60px] md:h-[60px] rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors shadow-sm">
                  {geoLoading ? <span className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" /> : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                </button>

                <button type="submit"
                  className="h-12 md:h-[60px] px-8 bg-[#84cc16] text-white rounded-full text-sm font-black uppercase tracking-wide hover:bg-[#74b814] hover:shadow-[0_10px_30px_-5px_rgba(132,204,22,0.5)] transition-all flex items-center justify-center gap-2">
                  <span>Search</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </section>

      {/* ── PREMIUM DESTINATIONS MARQUEE (Auto-Scroll) ── */}
      <section className="relative w-full py-12 md:py-16 bg-white overflow-hidden border-b border-gray-100 flex flex-col items-center justify-center shadow-[0_20px_40px_-20px_rgba(0,0,0,0.03)] z-10">

        {/* Subtle title above the strip */}
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 text-center">
          Explore India's Most Breathtaking Routes
        </p>

        {/* Fading edges for seamless loop effect */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

        <div className="flex w-full overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap items-center w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 40, repeat: Infinity }}
          >
            {[
              "Leh Ladakh", "Manali", "Spiti Valley", "Rishikesh", "Goa", "Coorg", "Munnar", "Ooty",
              "Jaipur", "Udaipur", "Jaisalmer", "Meghalaya", "Tawang", "Andaman", "Darjeeling", "Srinagar",
              /* Duplicate array for seamless infinite scroll */
              "Leh Ladakh", "Manali", "Spiti Valley", "Rishikesh", "Goa", "Coorg", "Munnar", "Ooty",
              "Jaipur", "Udaipur", "Jaisalmer", "Meghalaya", "Tawang", "Andaman", "Darjeeling", "Srinagar"
            ].map((dest, i) => (
              <div key={i} className="flex items-center">
                <span className="text-xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter px-8 md:px-16 hover:text-[#84cc16] hover:scale-110 transition-all duration-300 cursor-default select-none">
                  {dest}
                </span>
                <span className="text-[#84cc16] text-opacity-30 text-xl">✦</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── VEHICLES GRID ── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 pt-6 md:pt-10 pb-32">

        {/* ── CATALOG HEADING ── */}
        <div className="text-center mb-0 md:mb-4">
          {/* Green accent live-count pill */}
          <div className="inline-flex items-center gap-2 bg-[#84cc16]/10 border border-[#84cc16]/20 text-[#84cc16] text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] animate-pulse"></span>
            {isLoading ? 'Searching...' : `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} available`}
          </div>

          {/* Main title */}
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            {(search || city || state)
              ? <><span className="text-gray-400 font-light">Results for </span>{search || locationDisplay}</>
              : <>Our <span className="text-[#84cc16]">Fleet</span></>
            }
          </h2>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="w-12 h-[2px] bg-gray-200 rounded-full"></span>
            <span className="text-gray-300 text-sm">✦</span>
            <span className="w-12 h-[2px] bg-gray-200 rounded-full"></span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] lg:rounded-[3.5rem] shadow-sm border border-gray-100 p-6 sm:p-10 lg:p-16 min-h-[50vh]">

          {/* Active Filters */}
          {(city || state || search || startDate || endDate) && (
            <div className="flex items-center gap-3 mb-10 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Active Filters:</span>
              {locationDisplay && <span className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-full">{locationDisplay}</span>}
              {startDate && <span className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-full">{startDate.split(' ')[0]} - {endDate ? endDate.split(' ')[0] : '...'}</span>}
              <button onClick={handleClearFilters} className="text-sm font-bold text-[#84cc16] hover:text-[#74b814] ml-2">Clear All</button>
            </div>
          )}

          {/* Standard Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-[2rem] bg-gray-100 animate-pulse h-[450px]" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-xl font-bold mb-6">No vehicles match your search.</p>
              <button onClick={handleClearFilters} className="px-8 py-4 bg-gray-900 text-white font-bold rounded-full shadow-lg hover:bg-black transition-all">
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {vehicles.map((v, index) => (
                <PremiumLightCard key={v._id} vehicle={v} index={index} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-20">
              <button onClick={() => { setPage((p) => Math.max(1, p - 1)); pushUrl(search, state, city, activeCategory, startDate, endDate, page - 1); }}
                disabled={page === 1}
                className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 text-gray-900 rounded-full disabled:opacity-30 hover:border-gray-900 transition-all font-bold shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="text-sm font-black text-gray-900 tracking-widest uppercase">{page} / {totalPages}</span>
              <button onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); pushUrl(search, state, city, activeCategory, startDate, endDate, page + 1); }}
                disabled={page === totalPages}
                className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 text-gray-900 rounded-full disabled:opacity-30 hover:border-gray-900 transition-all font-bold shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#fcfcfc] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VehiclesContent />
    </Suspense>
  );
}