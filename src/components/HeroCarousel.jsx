'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import SearchBar from './SearchBar';
import { getActiveBanners } from '@/services/cms.service';

const FALLBACK_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=2000&q=85',
    altText: 'Luxury tent camp under the stars',
    title: "DISCOVER NATURE'S",
    titleHighlight: "FINEST RETREATS",
    subtitle: "Disconnect from the noise and reconnect under the stars at our exclusive, hand-picked luxury campsites."
  },
  {
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=2000&q=85',
    altText: 'Overland vehicle by the lake',
    title: "ELEVATE YOUR",
    titleHighlight: "OUTDOOR ESCAPE",
    subtitle: "Experience the perfect blend of wild nature and unparalleled comfort with our premium glamping packages."
  },
  {
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=2000&q=85',
    altText: 'Camper van in the forest',
    title: "CONQUER THE",
    titleHighlight: "UNSEEN TRAILS",
    subtitle: "Rent high-end, self-drive adventure vehicles engineered for your most ambitious overland journeys."
  },
];

export default function HeroCarousel() {
  const [current, setSlide] = useState(0);

  const { data: apiBanners = [] } = useQuery({
    queryKey: ['hero-banners'],
    queryFn: () => getActiveBanners('hero'),
    staleTime: 5 * 60 * 1000,
  });

  const slides = apiBanners.length > 0 ? apiBanners : FALLBACK_SLIDES;

  useEffect(() => {
    const id = setInterval(() => setSlide((c) => (c + 1) % slides.length), 7000);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    setSlide(0);
  }, [slides.length]);

  return (
    <section className="relative w-full min-h-[850px] lg:min-h-[100vh] flex flex-col justify-center bg-black pt-32 pb-24 font-sans">

      {/* ── Background Wrapper with Overflow Hidden ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* ── Background Images & Transitions ── */}
        {slides.map((s, i) => (
          <Image
            key={s.image || i}
            src={s.image}
            alt={s.altText || s.title || 'Luxor Stays'}
            fill
            className="object-cover"
            style={{
              opacity: i === current ? 0.85 : 0,
              transform: i === current ? 'scale(1.05)' : 'scale(1)',
              transition: 'opacity 1.5s ease-in-out, transform 8s linear',
              zIndex: 1,
            }}
            priority={i === 0}
            unoptimized={s.image?.startsWith('http')}
          />
        ))}

        {/* ── Clean Neutral Overlay (No Green Background) ── */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/80 via-black/40 to-black/80 lg:bg-gradient-to-r lg:from-black/90 lg:via-black/50 lg:to-transparent" />

        {/* ── Smooth Animated Wave Separator (Pure White) ── */}
        <svg className="hero-waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" />
            <use xlinkHref="#gentle-wave" x="48" y="3" />
            <use xlinkHref="#gentle-wave" x="48" y="5" />
            <use xlinkHref="#gentle-wave" x="48" y="7" />
          </g>
        </svg>
      </div>

      {/* ── Main Layout ── */}
      <div className="relative z-[10] w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16 flex flex-col">

        {/* ── Typography & Stats ── */}
        <div className="flex flex-col items-center text-center mx-auto mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#84cc16]" />
            <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              India's Premier Luxury Escapes
            </span>
          </div>

          {slides[current] && (
            <h1 className="text-white font-black leading-[1.05] tracking-tight mb-5 drop-shadow-lg transition-opacity duration-700" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
              {slides[current].title || "DISCOVER NATURE'S"} <br />
              {slides[current].titleHighlight && (
                <span className="text-[#84cc16] block mt-2">{slides[current].titleHighlight}</span>
              )}
            </h1>
          )}

          <p className="text-white/90 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed mb-10 font-light drop-shadow-md transition-opacity duration-700">
            {slides[current]?.subtitle ||
              'Book exclusive glamping experiences and luxury self-drive vehicles for an unforgettable journey.'}
          </p>

          {/* Minimalist Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <StatBlock value="4.9/5" label="Average Rating" />
            <div className="w-px h-10 bg-white/30 hidden sm:block" />
            <StatBlock value="50+" label="Locations" />
            <div className="w-px h-10 bg-white/30 hidden sm:block" />
            <StatBlock value="10k+" label="Travelers" />
          </div>
        </div>

        {/* ── Search Bar Section ── */}
        <div className="w-full relative z-20 mt-4">
          <SearchBar />
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center justify-center gap-2 mt-12 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="rounded-full transition-all duration-300 ease-out"
              style={{
                width: i === current ? 40 : 10,
                height: 4,
                backgroundColor: i === current ? '#ffffff' : 'rgba(255,255,255,0.4)',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Styles ── */}
      <style>{`
        .hero-waves {
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 6vh;
          min-height: 50px;
          max-height: 100px;
          z-index: 10;
        }
        .parallax > use {
          animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
        }
        .parallax > use:nth-child(1) { animation-delay: -2s; animation-duration: 7s; fill: rgba(255,255,255,0.3); }
        .parallax > use:nth-child(2) { animation-delay: -3s; animation-duration: 10s; fill: rgba(255,255,255,0.5); }
        .parallax > use:nth-child(3) { animation-delay: -4s; animation-duration: 13s; fill: rgba(255,255,255,0.7); }
        .parallax > use:nth-child(4) { animation-delay: -5s; animation-duration: 20s; fill: #ffffff; }
        @keyframes move-forever {
          0% { transform: translate3d(-90px, 0, 0); }
          100% { transform: translate3d(85px, 0, 0); }
        }
      `}</style>
    </section>
  );
}

/* ── UI Helpers ── */
function StatBlock({ value, label }) {
  return (
    <div className="flex flex-col">
      <span className="text-white font-black text-2xl">{value}</span>
      <span className="text-white/80 text-[11px] font-semibold uppercase tracking-[0.2em] mt-1">{label}</span>
    </div>
  );
}