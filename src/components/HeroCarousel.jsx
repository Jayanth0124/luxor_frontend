'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import SearchBar from './SearchBar';
import { getActiveBanners } from '@/services/cms.service';

// Fallback slides shown while loading or if API returns nothing
const FALLBACK_SLIDES = [
  {
    image:   'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=2000&q=85',
    altText: 'Luxury glamping tents by the lake',
  },
  {
    image:   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85',
    altText: 'Mountain landscape at sunrise',
  },
  {
    image:   'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=2000&q=85',
    altText: 'Luxury tent camp under the stars',
  },
  {
    image:   'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=85',
    altText: 'Mountain road trip adventure',
  },
];

export default function HeroCarousel() {
  const [current, setSlide] = useState(0);
  const [tab,     setTab]   = useState('vehicle');

  const { data: apiBanners = [] } = useQuery({
    queryKey:  ['hero-banners'],
    queryFn:   () => getActiveBanners('hero'),
    staleTime: 5 * 60 * 1000,
  });

  const slides = apiBanners.length > 0 ? apiBanners : FALLBACK_SLIDES;

  useEffect(() => {
    const id = setInterval(() => setSlide((c) => (c + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  // Reset slide index if slides change
  useEffect(() => {
    setSlide(0);
  }, [slides.length]);

  return (
    <div
      className="relative flex flex-col"
      style={{ minHeight: '100svh', maxHeight: 960 }}
    >
      {/* ── Background images (crossfade) ── */}
      {slides.map((s, i) => (
        <Image
          key={s.image || i}
          src={s.image}
          alt={s.altText || s.title || ''}
          fill
          className="object-cover"
          style={{
            opacity:    i === current ? 1 : 0,
            transition: 'opacity 1.6s ease',
            zIndex:     1,
          }}
          priority={i === 0}
          unoptimized={s.image?.startsWith('http')}
        />
      ))}

      {/* ── Overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.38) 45%, rgba(0,0,0,0.72) 100%)',
          zIndex: 2,
        }}
      />

      {/* ── Main content (centered) ── */}
      <div
        className="relative flex-1 flex flex-col items-center justify-center text-center px-4"
        style={{ zIndex: 10, paddingTop: '6rem', paddingBottom: '1rem' }}
      >
        {/* Tag line */}
        <p className="text-[#84cc16] text-xs sm:text-sm font-black uppercase tracking-[0.22em] mb-5">
          India's Premier Luxury Travel Experience
        </p>

        {/* Giant headline — from banner or default */}
        {apiBanners.length > 0 && apiBanners[current] ? (
          <h1
            className="text-white font-black uppercase leading-none mb-5 px-2"
            style={{ fontSize: 'clamp(2.8rem, 10vw, 8.5rem)', letterSpacing: '-0.01em', lineHeight: 0.92 }}
          >
            {apiBanners[current].title}
            {apiBanners[current].titleHighlight && (
              <><br /><span className="text-[#84cc16]">{apiBanners[current].titleHighlight}</span></>
            )}
          </h1>
        ) : (
          <h1
            className="text-white font-black uppercase leading-none mb-5 px-2"
            style={{ fontSize: 'clamp(2.8rem, 10vw, 8.5rem)', letterSpacing: '-0.01em', lineHeight: 0.92 }}
          >
            Book Your<br />
            <span className="text-[#84cc16]">Perfect</span> Stay
          </h1>
        )}

        {/* Subtitle */}
        <p className="text-white/65 text-sm sm:text-base max-w-lg leading-relaxed mb-10 font-light">
          {apiBanners[current]?.subtitle ||
            'Discover handpicked glamping retreats and premium vehicles across India — where every journey becomes a memory.'}
        </p>

        {/* CTA buttons from banner OR default tab switcher */}
        {apiBanners[current]?.ctaButtons?.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            {apiBanners[current].ctaButtons.map((btn, i) => (
              <a
                key={i}
                href={btn.link || '#'}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  btn.variant === 'outline'
                    ? 'border-2 border-white text-white hover:bg-white/15'
                    : 'bg-[#84cc16] text-gray-900 hover:brightness-110'
                }`}
              >
                {btn.label}
              </a>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('campsite')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all ${
                tab === 'campsite'
                  ? 'bg-[#84cc16] text-gray-900'
                  : 'bg-white/15 text-white/75 hover:bg-white/25 backdrop-blur-sm'
              }`}
            >
              <TentIcon /> Book a Campsite
            </button>
            <button
              onClick={() => setTab('vehicle')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all ${
                tab === 'vehicle'
                  ? 'bg-[#84cc16] text-gray-900'
                  : 'bg-white/15 text-white/75 hover:bg-white/25 backdrop-blur-sm'
              }`}
            >
              <CarIcon /> Rent a Vehicle
            </button>
          </div>
        )}
      </div>

      {/* ── Search bar ── */}
      <div
        className="relative px-4 sm:px-6 md:px-10 xl:px-16"
        style={{ zIndex: 20 }}
      >
        <div className="max-w-screen-xl mx-auto">
          <SearchBar tab={tab} onTabChange={setTab} />
        </div>
      </div>

      {/* ── Slide dots ── */}
      <div className="relative flex justify-center gap-2 py-5" style={{ zIndex: 10 }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className="rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width:            i === current ? 24 : 7,
              height:           7,
              backgroundColor:  i === current ? '#84cc16' : 'rgba(255,255,255,0.35)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function TentIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20l9-16 9 16M3 20h18M9 20l3-5.333L15 20" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}
