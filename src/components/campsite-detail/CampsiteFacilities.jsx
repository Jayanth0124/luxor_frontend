import { 
  SparklesIcon, 
  TvIcon, 
  WifiIcon, 
  MapPinIcon 
} from '@/assets/icons';

// Curated list of premium custom inline SVGs for Luxury & Adventure amenities
function getFacilityIcon(name = '') {
  const norm = name.toLowerCase();

  // 1. Kitchen & Stove
  if (norm.includes('kitchen') || norm.includes('cook') || norm.includes('stove')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    );
  }
  // 2. Fridge / Refrigerator
  if (norm.includes('fridge') || norm.includes('refrigerator')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2zm0 4h6M9 12h6" />
      </svg>
    );
  }
  // 3. Solar & Eco Energy
  if (norm.includes('solar') || norm.includes('sun') || norm.includes('eco')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
    );
  }
  // 4. Sleep & Beds
  if (norm.includes('bed') || norm.includes('sleeping')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
  }
  // 5. Water / Tanks / Washrooms
  if (norm.includes('water') || norm.includes('tank') || norm.includes('bath') || norm.includes('washroom') || norm.includes('toilet') || norm.includes('ensuite')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  }
  // 6. Shower & Outdoor bath
  if (norm.includes('shower')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18m0 0a2 2 0 100 4h.5m-3.5-4a2 2 0 110-4H15" />
      </svg>
    );
  }
  // 7. Connectivity & Satellite
  if (norm.includes('satellite') || norm.includes('wifi') || norm.includes('wi-fi') || norm.includes('comm') || norm.includes('internet')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.05 9.336A6.97 6.97 0 003 12c0 1.111.26 2.162.724 3.097m0-6.193a7.184 7.184 0 013.25-3.25m-3.25 3.25l2.457 2.457m0 0a4.587 4.587 0 012.23-2.23m-2.23 2.23L8 12m1.95 3.664A6.97 6.97 0 0012 15a6.97 6.97 0 002.95-.336m-5 0l2.457-2.457M12 12l2.457 2.457m0 0a4.587 4.587 0 01-2.23 2.23m2.23-2.23L15 12m4.05-2.664A6.97 6.97 0 0121 12c0 1.112-.26 2.163-.724 3.098m0-6.193a7.185 7.185 0 00-3.25-3.25m3.25 3.25l-2.457 2.457m0 0a4.587 4.587 0 00-2.23-2.23m2.23 2.23L16 12" />
      </svg>
    );
  }
  // 8. Entertainment & Smart TV
  if (norm.includes('tv') || norm.includes('smart tv') || norm.includes('screen')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    );
  }
  // 9. Climate Control / Heat / AC
  if (norm.includes('air') || norm.includes('heater') || norm.includes('ac') || norm.includes('conditioning')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0L12 17l-.707-1.414a5 5 0 01.707-8.486" />
      </svg>
    );
  }
  // 10. Heavy Duty Gear / Towing / Winch / Snorkel / 4x4
  if (norm.includes('winch') || norm.includes('tires') || norm.includes('suspension') || norm.includes('hitch') || norm.includes('snorkel') || norm.includes('4x4')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }
  // 11. GPS Navigation & Map
  if (norm.includes('gps') || norm.includes('navigation') || norm.includes('map')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    );
  }

  // Fallback Luxury sparkle icon
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

// Generate premium subtitles for adventure / documentary aesthetic
function getFacilityCategory(name = '') {
  const norm = name.toLowerCase();
  if (norm.includes('kitchen') || norm.includes('fridge') || norm.includes('cook') || norm.includes('stove')) return 'Culinary / Living';
  if (norm.includes('solar') || norm.includes('generator') || norm.includes('power')) return 'Eco Power Grid';
  if (norm.includes('bed') || norm.includes('sleeping')) return 'Accommodations';
  if (norm.includes('water') || norm.includes('tank') || norm.includes('shower') || norm.includes('bath')) return 'Hydration & Bath';
  if (norm.includes('satellite') || norm.includes('wifi') || norm.includes('wi-fi') || norm.includes('comm') || norm.includes('gps') || norm.includes('navigation')) return 'Advanced Comm / Navigation';
  if (norm.includes('winch') || norm.includes('tires') || norm.includes('suspension') || norm.includes('snorkel') || norm.includes('4x4')) return 'Extreme Terrain Specs';
  return 'Premium Standard';
}

export default function CampsiteFacilities({ facilities = [] }) {
  if (!facilities?.length) return null;

  return (
    <div className="mb-10 relative bg-white border border-gray-100/80 rounded-[2rem] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden group z-10">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#84cc16]/5 rounded-full blur-3xl -z-10 group-hover:bg-[#84cc16]/10 transition-colors duration-1000 pointer-events-none" />

      {/* Editorial Header */}
      <div className="mb-8 border-b border-gray-100/80 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#84cc16] mb-1.5 drop-shadow-sm">SPECIFICATIONS</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">
              Equipped Amenities
            </h2>
            <p className="text-xs text-gray-400 mt-2 max-w-sm">
              Handpicked premium systems designed for completely self-sustained comfort in the wild.
            </p>
          </div>
          <span className="shrink-0 bg-lime-50 border border-lime-100/60 text-[#65a30d] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
            {facilities.length} Included
          </span>
        </div>
      </div>

      {/* Grid Layout - 2 columns on mobile, 3 on larger screens */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {facilities.map((f) => {
          const category = getFacilityCategory(f);
          return (
            <div
              key={f}
              className="group flex items-start gap-3.5 bg-white border border-gray-100/90 rounded-2xl p-4 transition-all duration-300 hover:border-gray-200 hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.03)] hover:shadow-lime-500/[0.04] hover:-translate-y-0.5 cursor-default"
            >
              {/* Luxury Icon Container */}
              <div className="w-10 h-10 shrink-0 rounded-xl bg-lime-50/50 flex items-center justify-center text-[#84cc16] transition-all duration-300 group-hover:bg-[#84cc16] group-hover:text-gray-900">
                {getFacilityIcon(f)}
              </div>

              {/* Text Information */}
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                  {category}
                </p>
                <p className="text-sm font-extrabold text-gray-800 leading-snug group-hover:text-gray-900 transition-colors truncate">
                  {f}
                </p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
