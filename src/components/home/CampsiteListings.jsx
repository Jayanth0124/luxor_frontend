'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import CampsiteCard from './CampsiteCard';
import { getCampsites } from '@/services/campsites.service';

const DUMMY_CAMPSITES = [
  {
    _id: '1',
    name: 'Starfall Meadow Camp',
    slug: 'starfall-meadow-camp',
    type: 'Glamping',
    city: 'Manali',
    state: 'HP',
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
    price: 6100,
    rating: 4.8,
    reviews: 43,
    image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1000&auto=format&fit=crop',
  }
];

export default function CampsiteListings() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-campsites'],
    queryFn: () => getCampsites({ limit: 6 }),
  });
  const campsites = data?.campsites ?? [];

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 md:px-10 xl:px-16 bg-[#f8fafc]">
      <div className="max-w-screen-xl mx-auto">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[#84cc16] text-xs font-black uppercase tracking-[0.22em] mb-2">Handpicked Stays</p>
            <h2 className="text-gray-900 font-black leading-none" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em' }}>
              Featured Campsites
            </h2>
            <p className="text-gray-400 text-sm mt-2">Glamping experiences in India's most stunning natural settings</p>
          </div>
          <Link href="/campsites" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#84cc16] text-sm font-semibold transition-colors shrink-0">
            View All
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : campsites.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-16">No campsites listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {campsites.map((c) => <CampsiteCard key={c._id} campsite={c} />)}
          </div>
        )}

        {!isLoading && campsites.length > 0 && (
          <div className="mt-10 text-center">
            <Link href="/campsites" className="inline-flex items-center gap-2 text-gray-900 font-black text-sm px-8 py-3.5 rounded-xl bg-[#84cc16] hover:brightness-110 transition-all">
              Browse All Campsites
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
