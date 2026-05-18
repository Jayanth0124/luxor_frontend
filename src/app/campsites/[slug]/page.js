'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MapPinIcon } from '@/assets/icons';
import ImageGallery        from '@/components/vehicle-detail/ImageGallery';
import CampsiteFacilities  from '@/components/campsite-detail/CampsiteFacilities';
import CampsiteRules              from '@/components/campsite-detail/CampsiteRules';
import CampsiteBookingCard        from '@/components/campsite-detail/CampsiteBookingCard';
import RoomCard                   from '@/components/campsite-detail/RoomCard';
import ReviewsSection             from '@/components/ReviewsSection';
import CancellationPolicySection  from '@/components/CancellationPolicySection';
import YouTubeVideos       from '@/components/YouTubeVideos';
import { getCampsiteBySlug, getCampsiteBlockedPeriods } from '@/services/campsites.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8081';

function resolveImg(url, fallback) {
  if (!url) return fallback;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

function StarRow({ rating, numReviews, onReviewClick }) {
  if (rating == null) return null;
  return (
    <div className="flex items-center gap-1.5">
      {[1,2,3,4,5].map(n => (
        <svg key={n} className="w-4 h-4" fill={n <= Math.round(rating) ? '#84cc16' : 'none'}
          viewBox="0 0 24 24" stroke="#84cc16" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
      <span className="text-white font-bold text-sm ml-1">{rating}</span>
      {numReviews > 0 && (
        <button onClick={onReviewClick} className="text-white/60 text-xs hover:text-white transition-colors ml-0.5">
          ({numReviews} review{numReviews !== 1 ? 's' : ''})
        </button>
      )}
    </div>
  );
}

export default function CampsiteDetailPage() {
  const { slug } = useParams();
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const { data: campsite, isLoading, isError } = useQuery({
    queryKey: ['campsite', slug],
    queryFn:  () => getCampsiteBySlug(slug),
    enabled:  Boolean(slug),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: allBlocks = [] } = useQuery({
    queryKey: ['campsite-blocks', campsite?._id],
    queryFn:  () => getCampsiteBlockedPeriods(campsite._id),
    enabled:  Boolean(campsite?._id),
    staleTime: 5 * 60 * 1000,
  });

  const hasCampsiteWideBlock = allBlocks.some((b) => !b.roomId);
  const roomHasBlocks = (roomId) =>
    hasCampsiteWideBlock ||
    allBlocks.some((b) => b.roomId && (b.roomId === roomId || b.roomId?.toString() === roomId?.toString()));

  useEffect(() => {
    if (campsite?.rooms?.[0]?._id && !selectedRoomId) {
      setSelectedRoomId(campsite.rooms[0]._id);
    }
  }, [campsite]);

  if (isLoading) return (
    <div className="bg-[#f8fafc] min-h-screen pt-16 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isError || !campsite) return (
    <div className="bg-[#f8fafc] min-h-screen pt-16 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Campsite not found.</p>
    </div>
  );

  const c          = campsite;
  const facilities = c.facilities?.map((f) => f.name ?? f) ?? [];
  const rating     = c.averageRating;
  const numReviews = c.totalReviews ?? 0;
  const heroImg    = resolveImg(c.images?.[0]?.url, '/Images/camp.jpg');
  const minPrice   = c.rooms?.reduce((min, r) => (r.price != null && r.price < min ? r.price : min), Infinity);
  const displayPrice = isFinite(minPrice) ? minPrice : null;

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="bg-[#f8fafc] min-h-screen">

      {/* ══════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════ */}
      <div className="relative pt-16 overflow-hidden" style={{ minHeight: 340 }}>

        {/* Background image */}
        <Image
          src={heroImg}
          alt={c.name}
          fill
          className="object-cover object-center"
          unoptimized={heroImg.startsWith('http')}
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.85) 100%)'
        }} />

        {/* Content */}
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 xl:px-20 pt-8 pb-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-8">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <span>/</span>
            <a href="/campsites" className="hover:text-white transition-colors">Campsites</a>
            <span>/</span>
            <span className="text-white/80 truncate max-w-[200px]">{c.name}</span>
          </nav>

          {/* Badge */}
          {(c.stayType?.name ?? c.stayType) && (
            <div className="mb-3">
              <span className="bg-[#84cc16] text-gray-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                {c.stayType?.name ?? c.stayType}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-white font-black leading-none mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}>
            {c.name}
          </h1>

          {/* Rating */}
          <StarRow rating={rating} numReviews={numReviews} onReviewClick={() => scrollTo('reviews-section')} />

          {/* Location + host */}
          <div className="flex items-center gap-2 mt-3 flex-wrap text-sm text-white/55">
            <MapPinIcon className="w-4 h-4 text-white/40 shrink-0" />
            <span>{[c.address, c.city, c.state].filter(Boolean).join(', ')}</span>
            {(c.partner?.name || c.partner?.businessName) && (
              <>
                <span className="text-white/25">·</span>
                <span>Hosted by <span className="text-white/80 font-semibold">{c.partner?.name || c.partner?.businessName}</span></span>
              </>
            )}
          </div>
        </div>

        {/* Bottom quick-nav bar */}
        <div className="relative z-10 border-t border-white/10" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)' }}>
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 xl:px-20 flex items-center justify-between py-3">
            <div className="flex items-center gap-5 text-xs">
              {[
                { label: 'Available Stays', id: 'stays-section'        },
                { label: 'Facilities',      id: 'facilities-section'   },
                { label: 'Rules',           id: 'rules-section'        },
                { label: 'Cancellation',    id: 'cancellation-section' },
                { label: `Reviews${numReviews > 0 ? ` (${numReviews})` : ''}`, id: 'reviews-section' },
              ].map(({ label, id }) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="text-white/60 hover:text-white font-medium transition-colors hidden sm:block">
                  {label}
                </button>
              ))}
            </div>
            {displayPrice != null && (
              <span className="text-white font-black text-sm">
                from ₹{Number(displayPrice).toLocaleString('en-IN')}
                <span className="text-white/50 font-normal text-xs">/night</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STICKY BREADCRUMB
      ══════════════════════════════════════════ */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 xl:px-20 py-2.5 flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <a href="/" className="hover:text-[#84cc16] transition-colors">Home</a>
            <span>/</span>
            <a href="/campsites" className="hover:text-[#84cc16] transition-colors">Campsites</a>
            <span>/</span>
            <span className="text-gray-700 font-semibold truncate max-w-[180px]">{c.name}</span>
          </nav>
          <div className="hidden md:flex items-center gap-5 text-xs text-gray-400">
            {[
              { label: 'Available Stays', id: 'stays-section'        },
              { label: 'Facilities',      id: 'facilities-section'   },
              { label: 'Rules',           id: 'rules-section'        },
              { label: 'Cancellation',    id: 'cancellation-section' },
              { label: `Reviews${numReviews > 0 ? ` (${numReviews})` : ''}`, id: 'reviews-section' },
            ].map(({ label, id }) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="hover:text-[#84cc16] font-medium transition-colors">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 xl:px-20 pt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">

          {/* Left */}
          <div>
            <ImageGallery images={c.images ?? []} fallback="/Images/camp.jpg" name={c.name} />
            <YouTubeVideos videoIds={c.youtubeVideos ?? []} />

            {c.description && (
              <div className="mb-8 pt-6">
                <h2 className="text-base font-bold text-gray-900 mb-3">About this Campsite</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{c.description}</p>
              </div>
            )}

            <div id="facilities-section">
              <CampsiteFacilities facilities={facilities} />
            </div>

            {/* Available Stays */}
            {c.rooms?.length > 0 && (
              <div className="mb-8" id="stays-section">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900">Available Stays</h2>
                  <span className="text-xs text-gray-400">{c.rooms.length} option{c.rooms.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {c.rooms.map((room, i) => (
                    <RoomCard
                      key={room._id || i}
                      room={{
                        ...room,
                        category:   room.category?.name ?? room.category,
                        facilities: room.facilities?.map((f) => f.name ?? f) ?? [],
                      }}
                      isSelected={selectedRoomId === (room._id || i)}
                      onSelect={() => setSelectedRoomId(room._id)}
                      hasBlocks={roomHasBlocks(room._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div id="rules-section">
              <CampsiteRules campsite={c} />
            </div>
            {c.partner?._id && (
              <CancellationPolicySection partnerId={c.partner._id} />
            )}
            <div id="reviews-section">
              <ReviewsSection
                refType="Campsite"
                entityId={c._id}
                averageRating={c.averageRating}
                totalReviews={c.totalReviews}
              />
            </div>
          </div>

          {/* Right sticky booking card */}
          <CampsiteBookingCard campsite={c} selectedRoomId={selectedRoomId} onRoomSelect={setSelectedRoomId} />
        </div>
      </div>
    </div>
  );
}
