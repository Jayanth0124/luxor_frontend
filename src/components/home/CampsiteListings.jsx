'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import CampsiteCard from './CampsiteCard';
import { getCampsites } from '@/services/campsites.service';

export default function CampsiteListings() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-campsites-featured'],
    queryFn: () => getCampsites({ limit: 6 }),
    staleTime: 5 * 60 * 1000,
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
