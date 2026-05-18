import Link from 'next/link';

export default function BookingResourceCard({ resource, isVehicle, resourcePath, imgSrc }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {imgSrc && (
        <div className="h-48 sm:h-60 overflow-hidden">
          <img src={imgSrc} alt={resource?.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5">
        <span className="text-xs font-bold text-[#84cc16] uppercase tracking-wide">
          {isVehicle ? 'Vehicle' : 'Campsite'}
        </span>
        <h2 className="text-xl font-black text-gray-900 mt-0.5 leading-tight">{resource?.name ?? '—'}</h2>
        {(resource?.city || resource?.state) && (
          <div className="flex items-center gap-1.5 mt-1">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p className="text-sm text-gray-400">
              {[resource.city, resource.state].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
        {resource?.slug && (
          <Link
            href={`/${resourcePath}/${resource.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold mt-3 transition-colors hover:underline"
            style={{ color: '#84cc16' }}
          >
            View listing
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
