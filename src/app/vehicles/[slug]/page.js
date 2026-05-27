'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MapPinIcon } from '@/assets/icons';
import ImageGallery from '@/components/vehicle-detail/ImageGallery';
import VehicleSpecs from '@/components/vehicle-detail/VehicleSpecs';
import VehicleFacilities from '@/components/vehicle-detail/VehicleFacilities';
import VehicleRules from '@/components/vehicle-detail/VehicleRules';
import PricingTable from '@/components/vehicle-detail/PricingTable';
import VehicleBookingCard from '@/components/vehicle-detail/VehicleBookingCard';
import ReviewsSection from '@/components/ReviewsSection';
import CancellationPolicySection from '@/components/CancellationPolicySection';
import YouTubeVideos from '@/components/YouTubeVideos';
import { getVehicleBySlug } from '@/services/vehicles.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8081';

function resolveImg(url, fallback) {
  if (!url) return fallback;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

const DUMMY_VEHICLES = [
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
    images: [
      { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop' },
      { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop' },
      { url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000&auto=format&fit=crop' }
    ],
    facilities: ['GPS Navigation', 'AC & Heating', 'Roof Rack', 'All-Wheel Drive', 'Recovery Gear', 'Camp Table & Chairs'],
    averageRating: 4.9,
    totalReviews: 42,
    allowsOutsideState: true,
    rules: { securityDeposit: 15000, cleaningFee: 1500, lateReturnFee: 2000, minimumAge: 21 },
    youtubeVideos: [],
    pricing: {
      type: 'per_day',
      commonPrice: 8500,
      perDayPrices: [
        { dayRange: '1-3 days', price: 8500 },
        { dayRange: '4-7 days', price: 8000 },
        { dayRange: '8+ days', price: 7500 }
      ]
    }
  }
];

export default function VehicleDetailPage() {
  const { slug } = useParams();

  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: ['public-vehicle', slug],
    queryFn: () => getVehicleBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) return (
    <div className="bg-[#f8fafc] min-h-screen pt-16 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isError) return (
    <div className="bg-[#f8fafc] min-h-screen pt-16 flex items-center justify-center">
      <p className="text-gray-500 font-semibold">Vehicle not found.</p>
    </div>
  );

  const v = vehicle;
  const facilities = v.facilities?.map((f) => f.name ?? f) ?? [];

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-24 pt-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── ENTERPRISE HEADER ── */}
        <div className="mb-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-medium">
            <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
            <span>/</span>
            <a href="/vehicles" className="hover:text-gray-900 transition-colors">Vehicles</a>
            <span>/</span>
            <span className="text-gray-900">{v.name}</span>
          </nav>

          {/* Title & Badges */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                {v.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-600">
                <div className="flex items-center gap-1.5 bg-[#84cc16]/10 text-[#65a30d] px-2.5 py-1 rounded-md">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                  <span>{v.averageRating} ({v.totalReviews} Reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  <span>{[v.city, v.state].filter(Boolean).join(', ')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span>{v.category?.name ?? v.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── INDUSTRY STANDARD GALLERY ── */}
        <div className="mb-8">
          <ImageGallery images={v.images ?? []} name={v.name} />
        </div>

        {/* ── TWO-COLUMN CONTENT ARCHITECTURE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

          {/* Left Column: Heavy UI Cards */}
          <div className="flex flex-col gap-8">
            <VehicleSpecs vehicle={v} />
            <VehicleFacilities facilities={facilities} />
            {v.pricing?.type === 'per_day' && <PricingTable prices={v.pricing.perDayPrices ?? []} />}
            <VehicleRules vehicle={v} />
            {v.partner?._id && <CancellationPolicySection partnerId={v.partner._id} />}
            <ReviewsSection refType="Vehicle" entityId={v._id} averageRating={v.averageRating} totalReviews={v.totalReviews} />
          </div>

          {/* Right Column: Booking Console (Normal Scroll Flow) */}
          <div className="w-full">
            <VehicleBookingCard vehicle={v} />
          </div>

        </div>
      </div>
    </div>
  );
}