import Image from 'next/image';
import Link from 'next/link';

function toSlug(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function normalize(v) {
  const price =
    v.price ??
    v.pricing?.commonPrice ??
    v.pricing?.perDayPrices?.[0]?.price ??
    null;

  return {
    slug: v.slug || toSlug(v.name),
    name: v.name,
    category: v.category?.name ?? v.category ?? 'Vehicle',
    seats: v.seats ?? v.seatingCapacity ?? '4',
    location: v.location ?? [v.city, v.state].filter(Boolean).join(', '),
    price,
    rating: v.rating,
    reviews: v.reviews,
    imgSrc: v.image ?? v.images?.[0]?.url ?? '/Images/car.jpg',
    transmission: v.transmission ?? 'Automatic',
    fuel: v.fuelType ?? 'Diesel'
  };
}

export default function VehicleCard({ vehicle }) {
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
            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-1.5 group-hover:text-[#84cc16] transition-colors line-clamp-1">
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
