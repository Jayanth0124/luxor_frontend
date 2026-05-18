'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MapPinIcon } from '@/assets/icons';
import ImageGallery      from '@/components/vehicle-detail/ImageGallery';
import VehicleSpecs      from '@/components/vehicle-detail/VehicleSpecs';
import VehicleFacilities from '@/components/vehicle-detail/VehicleFacilities';
import VehicleRules              from '@/components/vehicle-detail/VehicleRules';
import PricingTable              from '@/components/vehicle-detail/PricingTable';
import VehicleBookingCard        from '@/components/vehicle-detail/VehicleBookingCard';
import ReviewsSection            from '@/components/ReviewsSection';
import CancellationPolicySection from '@/components/CancellationPolicySection';
import YouTubeVideos     from '@/components/YouTubeVideos';
import { getVehicleBySlug } from '@/services/vehicles.service';

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

export default function VehicleDetailPage() {
  const { slug } = useParams();

  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: ['vehicle', slug],
    queryFn:  () => getVehicleBySlug(slug),
    enabled:  Boolean(slug),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  if (isLoading) return (
    <div className="bg-[#f8fafc] min-h-screen pt-16 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isError || !vehicle) return (
    <div className="bg-[#f8fafc] min-h-screen pt-16 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Vehicle not found.</p>
    </div>
  );

  const v          = vehicle;
  const facilities = v.facilities?.map((f) => f.name ?? f) ?? [];
  const rating     = v.averageRating;
  const numReviews = v.totalReviews ?? 0;
  const heroImg    = resolveImg(v.images?.[0]?.url, '/Images/car.jpg');
  const price      = v.pricing?.commonPrice ?? v.pricing?.perDayPrices?.[0]?.price ?? null;

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
          alt={v.name}
          fill
          className="object-cover object-center"
          unoptimized={heroImg.startsWith('http')}
          priority
        />

        {/* Overlay: dark bottom-heavy gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.50) 40%, rgba(0,0,0,0.82) 100%)'
        }} />

        {/* Content */}
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 xl:px-20 pt-8 pb-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-8">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <span>/</span>
            <a href="/vehicles" className="hover:text-white transition-colors">Vehicles</a>
            <span>/</span>
            <span className="text-white/80 truncate max-w-[200px]">{v.name}</span>
          </nav>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {(v.category?.name ?? v.category) && (
              <span className="bg-[#84cc16] text-gray-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                {v.category?.name ?? v.category}
              </span>
            )}
            {v.allowsOutsideState && (
              <span className="text-white text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(59,130,246,0.3)', border: '1px solid rgba(59,130,246,0.5)' }}>
                Pan-India Travel
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-white font-black leading-none mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}>
            {v.name}
          </h1>

          {/* Rating row */}
          <StarRow rating={rating} numReviews={numReviews} onReviewClick={() => scrollTo('reviews-section')} />

          {/* Location + host */}
          <div className="flex items-center gap-2 mt-3 flex-wrap text-sm text-white/55">
            <MapPinIcon className="w-4 h-4 text-white/40 shrink-0" />
            <span>{[v.city, v.state].filter(Boolean).join(', ')}</span>
            {(v.partner?.name || v.partner?.businessName) && (
              <>
                <span className="text-white/25">·</span>
                <span>Hosted by <span className="text-white/80 font-semibold">{v.partner?.name || v.partner?.businessName}</span></span>
              </>
            )}
          </div>
        </div>

        {/* Bottom quick-nav bar — sits on the hero bottom edge */}
        <div className="relative z-10 border-t border-white/10" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)' }}>
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 xl:px-20 flex items-center justify-between py-3">
            <div className="flex items-center gap-5 text-xs">
              {[
                { label: 'Facilities',   id: 'facilities-section'  },
                { label: 'Rules',        id: 'rules-section'       },
                { label: 'Cancellation', id: 'cancellation-section'},
                { label: `Reviews${numReviews > 0 ? ` (${numReviews})` : ''}`, id: 'reviews-section' },
              ].map(({ label, id }) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="text-white/60 hover:text-white font-medium transition-colors">
                  {label}
                </button>
              ))}
            </div>
            {price != null && (
              <span className="text-white font-black text-sm">
                ₹{Number(price).toLocaleString('en-IN')}
                <span className="text-white/50 font-normal text-xs">/day</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STICKY BREADCRUMB (appears on scroll)
      ══════════════════════════════════════════ */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 xl:px-20 py-2.5 flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <a href="/" className="hover:text-[#84cc16] transition-colors">Home</a>
            <span>/</span>
            <a href="/vehicles" className="hover:text-[#84cc16] transition-colors">Vehicles</a>
            <span>/</span>
            <span className="text-gray-700 font-semibold truncate max-w-[180px]">{v.name}</span>
          </nav>
          <div className="hidden md:flex items-center gap-5 text-xs text-gray-400">
            {[
              { label: 'Facilities',   id: 'facilities-section'   },
              { label: 'Rules',        id: 'rules-section'        },
              { label: 'Cancellation', id: 'cancellation-section' },
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
            <ImageGallery images={v.images ?? []} fallback="/Images/car.jpg" name={v.name} />
            <YouTubeVideos videoIds={v.youtubeVideos ?? []} />
            <VehicleSpecs vehicle={v} />
            <div id="facilities-section">
              <VehicleFacilities facilities={facilities} />
            </div>
            {v.pricing?.type === 'per_day' && (
              <PricingTable prices={v.pricing.perDayPrices ?? []} />
            )}
            <div id="rules-section">
              <VehicleRules vehicle={v} />
            </div>
            {v.partner?._id && (
              <CancellationPolicySection partnerId={v.partner._id} />
            )}
            <div id="reviews-section">
              <ReviewsSection
                refType="Vehicle"
                entityId={v._id}
                averageRating={v.averageRating}
                totalReviews={v.totalReviews}
              />
            </div>
          </div>

          {/* Right sticky booking card */}
          <VehicleBookingCard vehicle={v} />
        </div>
      </div>
    </div>
  );
}
