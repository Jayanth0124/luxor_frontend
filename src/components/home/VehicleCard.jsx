import Image from 'next/image';
import Link from 'next/link';
import { MapPinIcon, UsersIcon, StarIcon } from '@/assets/icons';

function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function normalize(v) {
  const price =
    v.price ??
    v.pricing?.commonPrice ??
    v.pricing?.perDayPrices?.[0]?.price ??
    null;

  return {
    slug:     v.slug || toSlug(v.name),
    name:     v.name,
    category: v.category?.name ?? v.category ?? '',
    seats:    v.seats ?? v.seatingCapacity ?? '',
    location: v.location ?? [v.city, v.state].filter(Boolean).join(', '),
    price,
    rating:   v.rating,
    reviews:  v.reviews,
    imgSrc:   v.image ?? v.images?.[0]?.url ?? '/Images/car.jpg',
  };
}

export default function VehicleCard({ vehicle }) {
  const v = normalize(vehicle);

  return (
    <Link
      href={`/vehicles/${v.slug}`}
      className="group block bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.13)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        <Image
          src={v.imgSrc}
          alt={v.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          unoptimized={v.imgSrc.startsWith('http')}
        />

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Category badge */}
        {v.category && (
          <div className="absolute top-3 left-3">
            <span
              className="text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {v.category}
            </span>
          </div>
        )}

        {/* Rating badge */}
        {v.rating != null && (
          <div className="absolute top-3 right-3">
            <span
              className="flex items-center gap-1 text-white text-[10px] font-black px-2.5 py-1.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <StarIcon className="w-3 h-3 text-[#84cc16]" />
              {v.rating}
            </span>
          </div>
        )}

        {/* Price pinned at image bottom */}
        {v.price != null && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-[#84cc16] text-gray-900 text-xs font-black px-3 py-1.5 rounded-full">
              ₹{Number(v.price).toLocaleString('en-IN')}<span className="font-semibold">/day</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-4 pb-5">
        <h3 className="font-black text-gray-900 text-base leading-tight mb-1.5 group-hover:text-[#65a30d] transition-colors">
          {v.name}
        </h3>

        {v.location && (
          <div className="flex items-center gap-1.5 mb-3">
            <MapPinIcon className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <span className="text-xs text-gray-400 truncate">{v.location}</span>
          </div>
        )}

        {/* Specs row */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 pb-4 border-b border-gray-100">
          {v.seats !== '' && (
            <span className="flex items-center gap-1.5">
              <UsersIcon className="w-3.5 h-3.5 text-gray-300" />
              {v.seats} Seats
            </span>
          )}
          {v.reviews != null && (
            <>
              <span className="text-gray-200">·</span>
              <span>{v.reviews} reviews</span>
            </>
          )}
        </div>

        {/* CTA */}
        <span className="w-full flex items-center justify-center gap-2 bg-[#84cc16] hover:brightness-105 text-gray-900 text-sm font-black py-2.5 rounded-xl transition-all">
          Book Now
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
