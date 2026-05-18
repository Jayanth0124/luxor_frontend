import Image from 'next/image';
import Link from 'next/link';
import { MapPinIcon, UsersIcon, StarIcon } from '@/assets/icons';

function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function normalize(c) {
  const maxGuests = c.guests ?? c.rooms?.reduce((acc, r) => Math.max(acc, r.capacity ?? 0), 0) ?? null;

  return {
    slug:     c.slug || toSlug(c.name),
    name:     c.name,
    type:     c.type ?? c.stayType?.name ?? c.stayType ?? '',
    location: c.location ?? [c.city, c.state].filter(Boolean).join(', '),
    guests:   maxGuests,
    price:    c.price ?? null,
    rating:   c.rating,
    reviews:  c.reviews,
    imgSrc:   c.image ?? c.images?.[0]?.url ?? '/Images/camp.jpg',
  };
}

export default function CampsiteCard({ campsite }) {
  const c = normalize(campsite);

  return (
    <Link
      href={`/campsites/${c.slug}`}
      className="group block bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.13)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden" style={{ height: 230 }}>
        <Image
          src={c.imgSrc}
          alt={c.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          unoptimized={c.imgSrc.startsWith('http')}
        />

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Type badge */}
        {c.type && (
          <div className="absolute top-3 left-3">
            <span
              className="text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {c.type}
            </span>
          </div>
        )}

        {/* Rating badge */}
        {c.rating != null && (
          <div className="absolute top-3 right-3">
            <span
              className="flex items-center gap-1 text-white text-[10px] font-black px-2.5 py-1.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <StarIcon className="w-3 h-3 text-[#84cc16]" />
              {c.rating}
            </span>
          </div>
        )}

        {/* Price pinned at image bottom */}
        {c.price != null && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-[#84cc16] text-gray-900 text-xs font-black px-3 py-1.5 rounded-full">
              ₹{Number(c.price).toLocaleString('en-IN')}<span className="font-semibold">/night</span>
            </span>
          </div>
        )}

        {/* Name + location overlaid at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-black text-white text-base leading-tight drop-shadow-md group-hover:text-[#84cc16] transition-colors">
            {c.name}
          </h3>
          {c.location && (
            <div className="flex items-center gap-1.5 mt-1">
              <MapPinIcon className="w-3 h-3 text-white/60 shrink-0" />
              <span className="text-white/70 text-xs truncate">{c.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-4 pb-5">
        {/* Specs + reviews */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 pb-4 border-b border-gray-100">
          {c.guests != null && c.guests > 0 && (
            <span className="flex items-center gap-1.5">
              <UsersIcon className="w-3.5 h-3.5 text-gray-300" />
              Up to {c.guests} guests
            </span>
          )}
          {c.reviews != null && (
            <>
              <span className="text-gray-200">·</span>
              <span>{c.reviews} reviews</span>
            </>
          )}
        </div>

        {/* CTA */}
        <span className="w-full flex items-center justify-center gap-2 bg-[#84cc16] hover:brightness-105 text-gray-900 text-sm font-black py-2.5 rounded-xl transition-all">
          Check Availability
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
